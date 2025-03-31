// import { foods } from '@/data';
import path from 'path';
import { promises as fs } from 'fs';
import Link from 'next/link';

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
import { FoodData, ManualFoodData, NutritionFacts } from '@/types';

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
  const readNutriants = getNutriantsFromExcelWorkbook(
    nutriantWorkbook,
    fatWorkbook
  );

  const estatFoodData: FoodData[] = crossFoodReference.map(
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
      const { name: productName, ...nutriantValues } =
        readNutriants(shokuhinbangou);
      const nutriantValuesWithoutNull = parseNutritionsRaw(nutriantValues);

      return {
        ...nutriantValuesWithoutNull,
        name: priceData.name + ' (' + productName + ')',
        shokuhinbangou,
        cost: pricePer100,
      };
    }
  );
  const manualIngredentData: FoodData[] = foodIngredientDataReference.map(
    (food) => {
      const pricePer100 = (food.price / food.massGram) * 100;
      const { name: productName, ...nutriantValues } = readNutriants(
        food.shokuhinbangou
      );
      const nutriantValuesWithoutNull = parseNutritionsRaw(nutriantValues);
      return {
        ...nutriantValuesWithoutNull,
        name: productName + ' (' + food.name + ')',
        shokuhinbangou: food.shokuhinbangou,
        cost: pricePer100,
      };
    }
  );

  // それぞれのtypeについては、要整理。estat idがある場合や、URLがある場合など、型ガードを検討。
  const manualFoodProductData: ManualFoodData[] = foodProductDataReferences.map(
    (food) => {
      const {
        price,
        productMassGram,
        massForNutritionGram,
        name,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        url,
        ...nutriantValues
      } = food;
      const pricePer100 = (price / productMassGram) * 100;
      // nutriantValuesの値を100/massForNutritionGram倍する
      const nutrientFactsPer100 = Object.fromEntries(
        Object.entries(nutriantValues).map(([key, value]) => [
          key,
          (value ?? 0) * (100 / massForNutritionGram),
        ])
      ) as NutritionFacts;
      return {
        ...nutrientFactsPer100,
        name: name,
        cost: pricePer100,
      };
    }
  );
  // サーバー側で最適化を実行
  const foodData: ManualFoodData[] = [
    ...estatFoodData,
    ...manualIngredentData,
    ...manualFoodProductData,
  ];
  const { totalCost, breakdown } = await optimizeDiet(
    foodData,
    referenceDailyIntakes
  );

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        ビーガン向け1日に最適な食材の組み合わせ
        (33-49歳、身体活動レベルふつう、男性)
      </h1>
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
      <p className="mb-2">
        総コスト: <strong>¥{Math.ceil(totalCost)}</strong>
      </p>
      <h2 className="text-xl font-semibold mt-4 mb-2">購入量と金額内訳:</h2>
      <ul className="list-disc list-inside">
        {breakdown.map(({ name, grams, cost }) => (
          <li key={name}>
            {name}: ¥{Math.round(cost)} / {grams.toFixed(2)} g
          </li>
        ))}
      </ul>
    </main>
  );
}
