import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';

import NutritionSummary from '@/components/nutrition-summary';
import IngredientsList from '@/components/ingredients-list';
import NutritionCategoryCharts from '@/components/nutrition-category-charts';

import {
  crossFoodReference,
  foodIngredientDataReference,
  foodProductDataReferences,
} from '@/data';
import ThemeImage from '@/components/theme-image';
import {
  getNutriantsFromExcelWorkbook,
  makeReadPriceFromExcelData,
  optimizeDiet,
  readExcelWorkbook,
  readDataFromExcelBuffer,
  referenceDailyIntakes,
  trimData,
  parseNutritionsRaw,
} from '@/services';
import {
  EstatPriceFoodData,
  ManualFoodData,
  ManualPriceFoodData,
  NutritionFactBase,
} from '@/types/nutrition';
import Link from 'next/link';

const DATA_DIR = 'public_data';

export default async function DietPage() {
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
      const { name: nutritionFactName, nutritionFacts: nutritionRawFacts } =
        readNutritionFacts(food.shokuhinbangou);
      const nutriantValuesWithoutNull = parseNutritionsRaw(nutritionRawFacts);
      return {
        nutritionFacts: nutriantValuesWithoutNull,
        productName: food.name,
        nutritionFactName: nutritionFactName,
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
        .digest('base64'),
      type: 'estat' as const,
    })),
    ...manualPriceIngredentData.map((data) => ({
      ...data,
      id: crypto
        .createHash('sha256')
        .update(data.productName + data.nutritionFactName)
        .digest('base64'),
      type: 'manualPrice' as const,
    })),
    ...manualFoodProductData.map((data) => ({
      ...data,
      id: crypto.createHash('sha256').update(data.productName).digest('base64'),
      type: 'manual' as const,
    })),
  ];
  const { totalCost, totalNutritionFacts, breakdown } = optimizeDiet(
    foods,
    referenceDailyIntakes
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            栄養最適化の結果
          </h1>
          <p className="text-emerald-600">
            栄養バランスを最適化し、コストを最小限に抑えた食材の組み合わせです
          </p>
        </header>

        <div className="grid gap-8">
          {/* 総合サマリー */}
          <NutritionSummary
            totalCost={totalCost}
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
          />

          {/* 食材リスト */}
          <IngredientsList ingredients={breakdown} />

          {/* 栄養素カテゴリー別チャート */}
          <NutritionCategoryCharts
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
            breakdown={breakdown}
          />
        </div>
      </div>
      <Link
        href="https://github.com/nwatab/nutrition-optimizer"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <ThemeImage
          srcLight="/github-mark.svg"
          srcDark="/github-mark-white.svg"
          alt="GitHub"
          width={24}
          height={24}
        />
      </Link>
    </div>
  );
}
