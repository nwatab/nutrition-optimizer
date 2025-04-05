import { Card } from '@/components/ui/card';
import type { FoodRequired, NutritionFactBase } from '@/types/nutrition';
import Link from 'next/link';

export default function IngredientsList({
  ingredients,
}: {
  ingredients: FoodRequired[];
}) {
  // 栄養素の単位を取得する関数
  const getNutrientUnit = (key: keyof NutritionFactBase<number>): string => {
    const vitaminUnits: Record<string, string> = {
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
    };

    const mineralUnits: Record<string, string> = {
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

    const macroUnits: Record<string, string> = {
      calories: 'kcal',
      protein: 'g',
      fat: 'g',
      carbohydrates: 'g',
      fiber: 'g',
      saturatedFattyAcids: 'g',
      n6PolyunsaturatedFattyAcids: 'g',
      n3PolyunsaturatedFattyAcids: 'g',
      nacl: 'g',
    };

    if (key in vitaminUnits) return vitaminUnits[key];
    if (key in mineralUnits) return mineralUnits[key];
    if (key in macroUnits) return macroUnits[key];

    return '';
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        最適化された食材リスト
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-emerald-700 bg-emerald-50">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">食材名</th>
              <th className="px-4 py-3">重量 (g)</th>
              <th className="px-4 py-3">コスト (円)</th>
              <th className="px-4 py-3">カロリー (kcal)</th>
              <th className="px-4 py-3">タンパク質 (g)</th>
              <th className="px-4 py-3">脂質 (g)</th>
              <th className="px-4 py-3">炭水化物 (g)</th>
              <th className="px-4 py-3 rounded-tr-lg">食物繊維 (g)</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => (
              <tr
                key={ingredient.id}
                className={`border-b ${index % 2 === 0 ? 'bg-white/50' : 'bg-emerald-50/50'}`}
              >
                <td className="px-4 py-3 font-medium">
                  {ingredient.type === 'estat' && (
                    <span className="text-emerald-600 hover:text-emerald-800 hover:underline">
                      {ingredient.nameInEstat} (
                      {ingredient.nameInNutritionFacts})
                    </span>
                  )}
                  {ingredient.type === 'manualPrice' && (
                    <Link
                      href={ingredient.url}
                      className="text-emerald-600 hover:text-emerald-800 hover:underline"
                      target="_blank"
                    >
                      {ingredient.productName} ({ingredient.nutritionFactName})
                    </Link>
                  )}
                  {ingredient.type === 'manual' && (
                    <Link
                      href={ingredient.url}
                      className="text-emerald-600 hover:text-emerald-800 hover:underline"
                      target="_blank"
                    >
                      {ingredient.productName}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3">
                  {(ingredient.hectoGrams * 100).toFixed(0)}
                </td>
                <td className="px-4 py-3">{ingredient.cost.toFixed(0)}</td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.calories.toFixed(0)}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.protein.toFixed(0)}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.fat.toFixed(0)}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.carbohydrates.toFixed(0)}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.fiber.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-emerald-800 bg-emerald-100/70">
              <td className="px-4 py-3 rounded-bl-lg">合計</td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.hectoGrams * 100, 0)
                  .toFixed(0)}
              </td>
              <td className="px-4 py-3">
                {ingredients.reduce((sum, ing) => sum + ing.cost, 0).toFixed(0)}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.calories, 0)
                  .toFixed(0)}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.protein, 0)
                  .toFixed(0)}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.fat, 0)
                  .toFixed(0)}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce(
                    (sum, ing) => sum + ing.nutritionFacts.carbohydrates,
                    0
                  )
                  .toFixed(0)}
              </td>
              <td className="px-4 py-3 rounded-br-lg">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.fiber, 0)
                  .toFixed(0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-emerald-800 mb-3">
          詳細な栄養素情報
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          各食材に含まれる詳細な栄養素情報を確認できます。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <div
              key={`detail-${ingredient.id}`}
              className="p-4 bg-white/80 rounded-lg shadow"
            >
              <h4 className="font-medium text-emerald-700 mb-2">
                {ingredient.type === 'estat'
                  ? ingredient.nameInEstat +
                    ' (' +
                    ingredient.nameInNutritionFacts +
                    ')'
                  : ingredient.type === 'manualPrice'
                    ? ingredient.productName +
                      ' (' +
                      ingredient.nutritionFactName +
                      ')'
                    : ingredient.productName}
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                {(ingredient.hectoGrams * 100).toFixed(0)}g /{' '}
                {ingredient.cost.toFixed(0)}円
              </p>

              <div className="space-y-2">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                    <span className="text-sm text-emerald-600">
                      詳細栄養素情報
                    </span>
                    <span className="transition group-open:rotate-180">
                      <svg
                        fill="none"
                        height="24"
                        width="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <div className="text-xs mt-2 space-y-1">
                    {/* ビタミン */}
                    <div className="mt-3">
                      <h5 className="text-xs font-semibold text-emerald-700 mb-1">
                        ビタミン
                      </h5>
                      {Object.entries(ingredient.nutritionFacts)
                        .filter(([key]) =>
                          key.toLowerCase().includes('vitamin')
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}</span>
                            <span className="font-medium">
                              {value.toFixed(2)}{' '}
                              {getNutrientUnit(
                                key as keyof NutritionFactBase<number>
                              )}
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* ミネラル */}
                    <div className="mt-3">
                      <h5 className="text-xs font-semibold text-emerald-700 mb-1">
                        ミネラル
                      </h5>
                      {Object.entries(ingredient.nutritionFacts)
                        .filter(([key]) =>
                          [
                            'potassium',
                            'calcium',
                            'magnesium',
                            'phosphorus',
                            'iron',
                            'zinc',
                            'copper',
                            'manganese',
                            'iodine',
                            'selenium',
                            'chromium',
                            'molybdenum',
                          ].includes(key)
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}</span>
                            <span className="font-medium">
                              {value.toFixed(2)}{' '}
                              {getNutrientUnit(
                                key as keyof NutritionFactBase<number>
                              )}
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* 脂質詳細 */}
                    <div className="mt-3">
                      <h5 className="text-xs font-semibold text-emerald-700 mb-1">
                        脂質詳細
                      </h5>
                      {Object.entries(ingredient.nutritionFacts)
                        .filter(([key]) =>
                          [
                            'saturatedFattyAcids',
                            'n6PolyunsaturatedFattyAcids',
                            'n3PolyunsaturatedFattyAcids',
                          ].includes(key)
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}</span>
                            <span className="font-medium">
                              {value.toFixed(2)}{' '}
                              {getNutrientUnit(
                                key as keyof NutritionFactBase<number>
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
