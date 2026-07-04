import { unitMap } from '@/lib/unitmap';
import type { Message } from '@/locales';
import type { NutritionFactBase } from '@/types/nutrition';

type NutritionFactsTableProps = {
  nutritionFacts: NutritionFactBase<number>;
  messages: Message;
};

type NutrientCategory =
  | 'energy'
  | 'macronutrients'
  | 'vitamins'
  | 'minerals'
  | 'fatty acids';

// 栄養素のカテゴリーマッピング
const categoryMap: Record<keyof NutritionFactBase<number>, NutrientCategory> =
  {
    calories: 'energy',
    protein: 'macronutrients',
    fat: 'macronutrients',
    carbohydrates: 'macronutrients',
    fiber: 'macronutrients',
    vitaminA: 'vitamins',
    vitaminD: 'vitamins',
    vitaminE: 'vitamins',
    vitaminK: 'vitamins',
    vitaminB1: 'vitamins',
    vitaminB2: 'vitamins',
    vitaminB6: 'vitamins',
    vitaminB12: 'vitamins',
    vitaminC: 'vitamins',
    niacin: 'vitamins',
    folate: 'vitamins',
    pantothenicAcid: 'vitamins',
    biotin: 'vitamins',
    saturatedFattyAcids: 'fatty acids',
    n6PolyunsaturatedFattyAcids: 'fatty acids',
    n3PolyunsaturatedFattyAcids: 'fatty acids',
    nacl: 'minerals',
    potassium: 'minerals',
    calcium: 'minerals',
    magnesium: 'minerals',
    phosphorus: 'minerals',
    iron: 'minerals',
    zinc: 'minerals',
    copper: 'minerals',
    manganese: 'minerals',
    iodine: 'minerals',
    selenium: 'minerals',
    chromium: 'minerals',
    molybdenum: 'minerals',
  };

// カテゴリーの表示順序
const categoryOrder: NutrientCategory[] = [
  'energy',
  'macronutrients',
  'vitamins',
  'minerals',
  'fatty acids',
];

export default function NutritionFactsTable({
  nutritionFacts,
  messages,
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-emerald-50">
            <th className="px-4 py-2 text-left text-emerald-800">
              {messages.nutrient}
            </th>
            <th className="px-4 py-2 text-right text-emerald-800">
              {messages.amount}
            </th>
            <th className="px-4 py-2 text-left text-emerald-800">
              {messages.unit}
            </th>
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
                  {messages[key as keyof NutritionFactBase<number>]}
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
