import type { NutritionFactBase } from '@/types/nutrition';

type NutritionFactsTableProps = {
  nutritionFacts: NutritionFactBase<number>;
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

// 栄養素のカテゴリーマッピング
const categoryMap: Record<keyof NutritionFactBase<number>, string> = {
  calories: 'エネルギー',
  protein: 'マクロ栄養素',
  fat: 'マクロ栄養素',
  carbohydrates: 'マクロ栄養素',
  fiber: 'マクロ栄養素',
  vitaminA: 'ビタミン',
  vitaminD: 'ビタミン',
  vitaminE: 'ビタミン',
  vitaminK: 'ビタミン',
  vitaminB1: 'ビタミン',
  vitaminB2: 'ビタミン',
  vitaminB6: 'ビタミン',
  vitaminB12: 'ビタミン',
  vitaminC: 'ビタミン',
  niacin: 'ビタミン',
  folate: 'ビタミン',
  pantothenicAcid: 'ビタミン',
  biotin: 'ビタミン',
  saturatedFattyAcids: '脂肪酸',
  n6PolyunsaturatedFattyAcids: '脂肪酸',
  n3PolyunsaturatedFattyAcids: '脂肪酸',
  nacl: 'ミネラル',
  potassium: 'ミネラル',
  calcium: 'ミネラル',
  magnesium: 'ミネラル',
  phosphorus: 'ミネラル',
  iron: 'ミネラル',
  zinc: 'ミネラル',
  copper: 'ミネラル',
  manganese: 'ミネラル',
  iodine: 'ミネラル',
  selenium: 'ミネラル',
  chromium: 'ミネラル',
  molybdenum: 'ミネラル',
};

export default function NutritionFactsTable({
  nutritionFacts,
}: NutritionFactsTableProps) {
  // カテゴリーごとに栄養素をグループ化
  const groupedNutrients = Object.entries(nutritionFacts).reduce(
    (acc, [key, value]) => {
      const category = categoryMap[key as keyof NutritionFactBase<number>];
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ key, value });
      return acc;
    },
    {} as Record<string, Array<{ key: string; value: number }>>
  );

  // カテゴリーの表示順序
  const categoryOrder = [
    'エネルギー',
    'マクロ栄養素',
    'ビタミン',
    'ミネラル',
    '脂肪酸',
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-emerald-50">
            <th className="px-4 py-2 text-left text-emerald-800">栄養素</th>
            <th className="px-4 py-2 text-right text-emerald-800">含有量</th>
            <th className="px-4 py-2 text-left text-emerald-800">単位</th>
          </tr>
        </thead>
        <tbody>
          {categoryOrder.map((category) =>
            groupedNutrients[category]?.map(({ key, value }, index) => (
              <tr
                key={key}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/50'} border-b border-emerald-100`}
              >
                <td className="px-4 py-2 font-medium">
                  {nameMap[key as keyof NutritionFactBase<number>]}
                </td>
                <td className="px-4 py-2 text-right">
                  {value.toFixed(key === 'calories' ? 0 : 1)}
                </td>
                <td className="px-4 py-2">
                  {unitMap[key as keyof NutritionFactBase<number>]}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
