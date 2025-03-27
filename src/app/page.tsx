// import { foods } from '@/data';
import path from 'path';
import { promises as fs } from 'fs';
import { crossFoodReference } from '@/data';
import {
  getNutriantFromExcelWorkbook,
  makeReadPriceFromExcelData,
  optimizeDiet,
  parseNutrientValue,
  readExcelWorkbook,
  readDataFromExcelBuffer,
  referenceDailyIntakes,
  trimData,
} from '@/services';
import { FoodData, NutritionFacts } from '@/types';

const nutriantNames: (keyof NutritionFacts)[] = [
  'calories',
  'protein',
  'fat',
  'fiber',
  'vitaminB12',
  'vitaminC',
  'saturatedFattyAcids',
  'n6PolyunsaturatedFattyAcids',
  'n3PolyunsaturatedFattyAcids',
  'carbohydrates', // 利用可能炭水化物（質量計）
  'vitaminA', // レチノール活性当量
  'vitaminD',
  'vitaminE', // α-トコフェロール
  'vitaminK',
  'vitaminB1',
  'vitaminB2',
  'niacin',
  'folate',
  'pantothenicAcid',
  'biotin',
  'nacl',
  'potassium',
  'calcium',
  'magnesium',
  'phosphorus',
  'iron',
  'zinc',
  'copper',
  'manganese', // マンガン
  'iodine',
  'selenium',
  'chromium',
  'molybdenum',
];

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
  const readNutriant = getNutriantFromExcelWorkbook(
    nutriantWorkbook,
    fatWorkbook
  );

  const estatFoodData: FoodData[] = crossFoodReference.map(
    ({ estatId, shokuhinbangou, estatMassGram }) => {
      const recentPricesOfProduct = readRecentPrices(estatId);
      if (
        recentPricesOfProduct === null ||
        recentPricesOfProduct.length === 0
      ) {
        throw new Error(`Price not found for ${estatId}`);
      }
      const priceOfProduct =
        recentPricesOfProduct
          .slice(-3)
          .reduce((acc, data) => acc + data.price, 0) /
        recentPricesOfProduct.slice(-3).length;

      const pricePer100 = (priceOfProduct / estatMassGram) * 100;
      const nutriantValues = nutriantNames.reduce(
        (acc, nutriant) => ({
          ...acc,
          [nutriant]: parseNutrientValue(
            readNutriant(shokuhinbangou, nutriant)
          ),
        }),
        {} as NutritionFacts
      );
      return {
        ...nutriantValues,
        name: recentPricesOfProduct[0].name,
        shokuhinbangou,
        cost: pricePer100,
      };
    }
  );

  // サーバー側で最適化を実行
  const { totalCost, breakdown } = await optimizeDiet(
    estatFoodData,
    referenceDailyIntakes
  );

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        ビーガン向け1日に最適な食材の組み合わせ
        (33-49歳、身体活動レベルふつう、男性)
      </h1>
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
