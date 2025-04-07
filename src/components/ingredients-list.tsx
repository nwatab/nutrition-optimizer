import { Card } from '@/components/ui/card';
import type { FoodRequired, NutritionTarget } from '@/types/nutrition';
import Link from 'next/link';
import RequiredIngredientDetailCard from './required-ingredient-detail-card';

export default function IngredientsList({
  ingredients,
  referenceDailyIntakes,
}: {
  ingredients: FoodRequired[];
  referenceDailyIntakes: NutritionTarget;
}) {
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
                <td className="px-4 py-3 font-medium flex flex-col gap-1">
                  {ingredient.type === 'estat' ? (
                    <span className="text-sm font-normal text-emerald-600">
                      {ingredient.nameInEstat}
                    </span>
                  ) : (
                    <Link
                      href={ingredient.url}
                      className="text-normal font-medium text-emerald-600 hover:text-emerald-800 hover:underline inline"
                      target="_blank"
                    >
                      {ingredient.productName}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline-block ml-1 align-text-top"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </Link>
                  )}
                  <Link
                    href={`/foods/${ingredient.id}`}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                  >
                    {ingredient.type === 'estat' ||
                    ingredient.type === 'manualPrice'
                      ? ingredient.nameInNutritionFacts
                      : '栄養成分へ'}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {(ingredient.hectoGrams * 100).toLocaleString('ja-JP', {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-4 py-3">
                  {ingredient.cost.toLocaleString('ja-JP', {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.calories.toLocaleString('ja-JP', {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.protein.toLocaleString('ja-JP', {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.fat.toLocaleString('ja-JP', {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.carbohydrates.toLocaleString(
                    'ja-JP',
                    {
                      maximumFractionDigits: 0,
                    }
                  )}
                </td>
                <td className="px-4 py-3">
                  {ingredient.nutritionFacts.fiber.toLocaleString('ja-JP', {
                    maximumFractionDigits: 0,
                  })}
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
                  .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.cost, 0)
                  .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.calories, 0)
                  .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.protein, 0)
                  .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.fat, 0)
                  .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3">
                {ingredients
                  .reduce(
                    (sum, ing) => sum + ing.nutritionFacts.carbohydrates,
                    0
                  )
                  .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
              </td>
              <td className="px-4 py-3 rounded-br-lg">
                {ingredients
                  .reduce((sum, ing) => sum + ing.nutritionFacts.fiber, 0)
                  .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
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
            <RequiredIngredientDetailCard
              key={ingredient.id}
              ingredient={ingredient}
              referenceDailyIntakes={referenceDailyIntakes}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
