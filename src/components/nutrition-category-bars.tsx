import type { NutritionFactBase } from '@/types/nutrition';

type NutritionCategoryBarsProps = {
  nutritionFacts: NutritionFactBase<number>;
  items: Array<keyof NutritionFactBase<number>>;
};

// 栄養素の日本語名マッピング
const nameMap: Record<keyof NutritionFactBase<number>, string> = {
  calories: 'カロリー',
  protein: 'タンパク質',
  fat: '脂質',
  carbohydrates: '炭水化物',
  fiber: '食物繊維',
  vitaminA: 'ビタミンA',
  vitaminD: 'ビタミンD',
  vitaminE: 'ビタミンE',
  vitaminK: 'ビタミンK',
  vitaminB1: 'ビタミンB1',
  vitaminB2: 'ビタミンB2',
  vitaminB6: 'ビタミンB6',
  vitaminB12: 'ビタミンB12',
  vitaminC: 'ビタミンC',
  niacin: 'ナイアシン',
  folate: '葉酸',
  pantothenicAcid: 'パントテン酸',
  biotin: 'ビオチン',
  saturatedFattyAcids: '飽和脂肪酸',
  n6PolyunsaturatedFattyAcids: 'n-6系多価不飽和脂肪酸',
  n3PolyunsaturatedFattyAcids: 'n-3系多価不飽和脂肪酸',
  nacl: '食塩相当量',
  potassium: 'カリウム',
  calcium: 'カルシウム',
  magnesium: 'マグネシウム',
  phosphorus: 'リン',
  iron: '鉄',
  zinc: '亜鉛',
  copper: '銅',
  manganese: 'マンガン',
  iodine: 'ヨウ素',
  selenium: 'セレン',
  chromium: 'クロム',
  molybdenum: 'モリブデン',
};

// 栄養素の単位マッピング
const unitMap: Record<keyof NutritionFactBase<number>, string> = {
  calories: 'kcal',
  protein: 'g',
  fat: 'g',
  carbohydrates: 'g',
  fiber: 'g',
  vitaminA: 'μg',
  vitaminD: 'μg',
  vitaminE: 'mg',
  vitaminK: 'μg',
  vitaminB1: 'mg',
  vitaminB2: 'mg',
  vitaminB6: 'mg',
  vitaminB12: 'μg',
  vitaminC: 'mg',
  niacin: 'mg',
  folate: 'μg',
  pantothenicAcid: 'mg',
  biotin: 'μg',
  saturatedFattyAcids: 'g',
  n6PolyunsaturatedFattyAcids: 'g',
  n3PolyunsaturatedFattyAcids: 'g',
  nacl: 'g',
  potassium: 'mg',
  calcium: 'mg',
  magnesium: 'mg',
  phosphorus: 'mg',
  iron: 'mg',
  zinc: 'mg',
  copper: 'mg',
  manganese: 'mg',
  iodine: 'μg',
  selenium: 'μg',
  chromium: 'μg',
  molybdenum: 'μg',
};

// 栄養素の基準値マッピング（一般的な1日の推奨摂取量の目安）
const benchmarkMap: Record<keyof NutritionFactBase<number>, number> = {
  calories: 2000,
  protein: 60,
  fat: 60,
  carbohydrates: 320,
  fiber: 20,
  vitaminA: 900,
  vitaminD: 8.5,
  vitaminE: 6.5,
  vitaminK: 150,
  vitaminB1: 1.2,
  vitaminB2: 1.4,
  vitaminB6: 1.4,
  vitaminB12: 2.4,
  vitaminC: 100,
  niacin: 15,
  folate: 240,
  pantothenicAcid: 5,
  biotin: 50,
  saturatedFattyAcids: 16,
  n6PolyunsaturatedFattyAcids: 10,
  n3PolyunsaturatedFattyAcids: 2,
  nacl: 7.5,
  potassium: 2500,
  calcium: 650,
  magnesium: 340,
  phosphorus: 800,
  iron: 7.5,
  zinc: 10,
  copper: 0.9,
  manganese: 4,
  iodine: 130,
  selenium: 30,
  chromium: 10,
  molybdenum: 25,
};

export default function NutritionCategoryBars({
  nutritionFacts,
  items,
}: NutritionCategoryBarsProps) {
  // 最大値を計算して相対的なバーの長さを決定
  const maxValue = Math.max(
    ...items.map((item) => (nutritionFacts[item] / benchmarkMap[item]) * 100)
  );

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = nutritionFacts[item];
        const benchmark = benchmarkMap[item];
        const percentage = (value / benchmark) * 100;
        const relativeWidth = (percentage / maxValue) * 100;

        return (
          <div key={item} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3 text-sm font-medium text-gray-700">
              {nameMap[item]}
            </div>
            <div className="col-span-7">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${percentage > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(relativeWidth, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="col-span-2 text-right text-sm text-gray-600">
              {value.toLocaleString('ja-JP', {
                maximumFractionDigits: 0,
              })}{' '}
              {unitMap[item]}
            </div>
          </div>
        );
      })}
      <div className="text-xs text-gray-500 mt-2">
        * バーの長さは各カテゴリー内での相対値を表しています
      </div>
    </div>
  );
}
