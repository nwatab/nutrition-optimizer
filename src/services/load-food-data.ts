import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';

import {
  crossFoodReference,
  foodIngredientDataReference,
  foodProductDataReferences,
  nutritionOnlyReference,
} from '@/data';
import { englishFoodNameOverrides } from '@/data/food-name-en-reference';

import {
  edibleCostPer100,
  getEnglishFoodNamesFromExcelWorkbook,
  getNutriantsFromExcelWorkbook,
  makeReadPriceFromExcelData,
  readExcelWorkbook,
  readDataFromExcelBuffer,
  trimData,
  parseNutritionsRaw,
} from '@/services';
import {
  EstatPriceFoodData,
  Food,
  ManualFoodData,
  ManualPriceFoodData,
  MextFoodData,
  NutritionFactBase,
} from '@/types/nutrition';

const DATA_DIR = 'public_data';

let cachedData: Food[] | null = null;

export const loadFoodData = async (): Promise<Food[]> => {
  if (cachedData) {
    return cachedData;
  }
  const [
    priceData1Buffer,
    priceData2Buffer,
    nutriantWorkbookBuffer,
    fatWorkbookBuffer,
    englishNameWorkbookBuffer,
  ] = await Promise.all(
    [
      'b002-1.xlsx',
      'b002-2.xlsx',
      '20230428-mxt_kagsei-mext_00001_012.xlsx',
      '20230428-mxt_kagsei-mext_00001_032.xlsx',
      '1374049_1r12_1.xlsx',
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
  const readEnglishName = getEnglishFoodNamesFromExcelWorkbook(
    readExcelWorkbook(englishNameWorkbookBuffer)
  );
  // 七訂英語版 → 八訂追加分オーバーライドの順で解決する。
  // どちらにも無い食品番号はビルドを止め、未訳のまま公開されるのを防ぐ。
  const englishNameOf = (shokuhinbangou: string): string => {
    const name =
      readEnglishName(shokuhinbangou) ??
      englishFoodNameOverrides[shokuhinbangou];
    if (!name) {
      throw new Error(
        `English food name not found for ${shokuhinbangou}. ` +
          'Add it to src/data/food-name-en-reference.ts.'
      );
    }
    return name;
  };

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
      const {
        name: nutritionFactName,
        nutritionFacts: nutriantRawFacts,
        refuseRate,
      } = readNutritionFacts(shokuhinbangou);
      const pricePer100 = edibleCostPer100(
        priceOfProduct,
        estatMass,
        refuseRate
      );
      const nutriantValuesWithoutNull = parseNutritionsRaw(nutriantRawFacts);

      return {
        nutritionFacts: nutriantValuesWithoutNull,
        nameInEstat: priceData.name,
        nameInNutritionFacts: nutritionFactName,
        nameEnInNutritionFacts: englishNameOf(shokuhinbangou),
        shokuhinbangou,
        cost: pricePer100,
      };
    }
  );
  const manualPriceIngredentData: ManualPriceFoodData[] =
    foodIngredientDataReference.map((food) => {
      const {
        name: nameInNutritionFacts,
        nutritionFacts: nutritionRawFacts,
        refuseRate,
      } = readNutritionFacts(food.shokuhinbangou);
      const pricePer100 = edibleCostPer100(
        food.price,
        food.massGram,
        refuseRate
      );
      const nutriantValuesWithoutNull = parseNutritionsRaw(nutritionRawFacts);
      return {
        nutritionFacts: nutriantValuesWithoutNull,
        productName: food.name,
        productNameJa: food.nameJa,
        productNameEn: food.nameEn,
        nameInNutritionFacts: nameInNutritionFacts,
        nameEnInNutritionFacts: englishNameOf(food.shokuhinbangou),
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
        refuseRate,
        name,
        nameJa,
        nameEn,
        url,
        nutritionFacts,
      } = food;
      const pricePer100g = edibleCostPer100(price, productMassGram, refuseRate);
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
        productNameJa: nameJa,
        productNameEn: nameEn,
        url: url,
        cost: pricePer100g,
      };
    }
  );

  // 価格なし食材。成分表の栄養値のみを載せる（cost は null）。
  const mextFoodData: MextFoodData[] = nutritionOnlyReference.map(
    (shokuhinbangou) => {
      const { name: nameInNutritionFacts, nutritionFacts: nutriantRawFacts } =
        readNutritionFacts(shokuhinbangou);
      return {
        nameInNutritionFacts,
        nameEnInNutritionFacts: englishNameOf(shokuhinbangou),
        shokuhinbangou,
        cost: null,
        nutritionFacts: parseNutritionsRaw(nutriantRawFacts),
      };
    }
  );

  // サーバー側で最適化を実行
  const foods: Food[] = [
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
    ...mextFoodData.map((data) => ({
      ...data,
      id: crypto
        .createHash('sha256')
        .update('mext:' + data.shokuhinbangou)
        .digest('hex'),
      type: 'mext' as const,
    })),
  ];

  // id は名前由来のハッシュなので、参照データに同じ食材が二重登録されると衝突する。
  // React の key 重複などにつながるため、ビルド時に落として登録ミスを検知する。
  const duplicateIds = foods
    .map((food) => food.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    const duplicates = foods
      .filter((food) => duplicateIds.includes(food.id))
      .map((food) =>
        'nameInEstat' in food
          ? food.nameInEstat
          : 'productName' in food
            ? food.productName
            : food.nameInNutritionFacts
      );
    throw new Error(
      `Duplicate food ids detected: ${[...new Set(duplicates)].join(', ')}. ` +
        'Check for duplicate entries in src/data.'
    );
  }

  cachedData = foods;
  return foods;
};
