import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';

import {
  crossFoodReference,
  foodIngredientDataReference,
  foodProductDataReferences,
} from '@/data';

import {
  getNutriantsFromExcelWorkbook,
  makeReadPriceFromExcelData,
  readExcelWorkbook,
  readDataFromExcelBuffer,
  trimData,
  parseNutritionsRaw,
} from '@/services';
import {
  EstatPriceFoodData,
  FoodToOptimize,
  ManualFoodData,
  ManualPriceFoodData,
  NutritionFactBase,
} from '@/types/nutrition';

const DATA_DIR = 'public_data';

let cachedData: FoodToOptimize[] | null = null;

export const loadFoodData = async (): Promise<FoodToOptimize[]> => {
  if (cachedData) {
    return cachedData;
  }
  const [
    priceData1Buffer,
    priceData2Buffer,
    nutriantWorkbookBuffer,
    fatWorkbookBuffer,
  ] = await Promise.all(
    [
      'b002-1.xlsx',
      'b002-2.xlsx',
      '20230428-mxt_kagsei-mext_00001_012.xlsx',
      '20230428-mxt_kagsei-mext_00001_032.xlsx',
    ]
      .map((filename) => path.join(process.cwd(), DATA_DIR, filename))
      .map((filepath) => fs.readFile(filepath))
  );
  const [priceReader1, priceReader2] = [priceData1Buffer, priceData2Buffer]
    .map(readDataFromExcelBuffer)
    .map(trimData)
    .map(makeReadPriceFromExcelData);
  const readRecentPrices = (estatId: number) =>
    priceReader1(estatId) ?? priceReader2(estatId);

  const [nutriantWorkbook, fatWorkbook] = [
    nutriantWorkbookBuffer,
    fatWorkbookBuffer,
  ].map(readExcelWorkbook);
  const readNutritionFacts = getNutriantsFromExcelWorkbook(
    nutriantWorkbook,
    fatWorkbook
  );

  const estatFoodData: EstatPriceFoodData[] = crossFoodReference.map(
    ({ estatId, estatMassGram, shokuhinbangou }) => {
      const priceData = readRecentPrices(estatId);
      if (priceData === null || priceData.prices.length === 0) {
        throw new Error(`Price not found for ${estatId}`);
      }
      const priceOfProduct =
        priceData.prices.slice(-3).reduce((acc, data) => acc + data.price, 0) /
        priceData.prices.slice(-3).length;

      const estatMass = estatMassGram ?? priceData.estatMassGram;
      if (!estatMass) {
        throw new Error(
          `Estat mass not found for ${estatId} (name: ${priceData.name})`
        );
      }
      const pricePer100 = (priceOfProduct / estatMass) * 100;
      const { name: nutritionFactName, nutritionFacts: nutriantRawFacts } =
        readNutritionFacts(shokuhinbangou);
      const nutriantValuesWithoutNull = parseNutritionsRaw(nutriantRawFacts);

      return {
        nutritionFacts: nutriantValuesWithoutNull,
        nameInEstat: priceData.name,
        nameInNutritionFacts: nutritionFactName,
        shokuhinbangou,
        cost: pricePer100,
      };
    }
  );
  const manualPriceIngredentData: ManualPriceFoodData[] =
    foodIngredientDataReference.map((food) => {
      const pricePer100 = (food.price / food.massGram) * 100;
      const { name: nameInNutritionFacts, nutritionFacts: nutritionRawFacts } =
        readNutritionFacts(food.shokuhinbangou);
      const nutriantValuesWithoutNull = parseNutritionsRaw(nutritionRawFacts);
      return {
        nutritionFacts: nutriantValuesWithoutNull,
        productName: food.name,
        nameInNutritionFacts: nameInNutritionFacts,
        shokuhinbangou: food.shokuhinbangou,
        cost: pricePer100,
        url: food.url,
      };
    });

  // それぞれのtypeについては、要整理。estat idがある場合や、URLがある場合など、型ガードを検討。
  const manualFoodProductData: ManualFoodData[] = foodProductDataReferences.map(
    (food) => {
      const {
        price,
        productMassGram,
        massForNutritionGram,
        name,
        url,
        nutritionFacts,
      } = food;
      const pricePer100g = (price / productMassGram) * 100;
      // nutriantValuesの値を100/massForNutritionGram倍する
      const nutrientFactsPer100 = Object.fromEntries(
        Object.entries(nutritionFacts).map(([key, value]) => [
          key,
          (value ?? 0) * (100 / massForNutritionGram),
        ])
      ) as NutritionFactBase<number>;
      return {
        nutritionFacts: nutrientFactsPer100,
        productName: name,
        url: url,
        cost: pricePer100g,
      };
    }
  );
  // サーバー側で最適化を実行
  const foods = [
    ...estatFoodData.map((data) => ({
      ...data,
      id: crypto
        .createHash('sha256')
        .update(data.nameInEstat + data.nameInNutritionFacts)
        .digest('hex'),
      type: 'estat' as const,
    })),
    ...manualPriceIngredentData.map((data) => ({
      ...data,
      id: crypto
        .createHash('sha256')
        .update(data.productName + data.nameInNutritionFacts)
        .digest('hex'),
      type: 'manualPrice' as const,
    })),
    ...manualFoodProductData.map((data) => ({
      ...data,
      id: crypto.createHash('sha256').update(data.productName).digest('hex'),
      type: 'manual' as const,
    })),
  ];

  cachedData = foods;
  return foods;
};
