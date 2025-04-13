import { Card } from '@/components/ui/card';
import type { FoodRequired } from '@/types/nutrition';
import Link from 'next/link';

export default function IngredientsList({
  ingredients,
}: {
  ingredients: FoodRequired[];
}) {
  return (
    <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        最適化された食材リスト
      </h2>

      <div className="relative overflow-x-auto sm:rounded-lg">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-emerald-200 table-auto">
              <thead className="bg-emerald-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap rounded-tl-lg"
                  >
                    食材名
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell"
                  >
                    重量 (g)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap hidden md:table-cell"
                  >
                    コスト (円)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    カロリー
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell"
                  >
                    タンパク質
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell"
                  >
                    脂質
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell"
                  >
                    炭水化物
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell rounded-tr-lg"
                  >
                    食物繊維
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-200">
                {ingredients.map((ingredient, index) => (
                  <tr
                    key={ingredient.id}
                    className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-emerald-50/50'} hover:bg-emerald-50`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {ingredient.type === 'estat' ? (
                          <span className="text-sm font-normal text-emerald-600 line-clamp-2 break-words">
                            {ingredient.nameInEstat}
                          </span>
                        ) : (
                          <Link
                            href={ingredient.url}
                            className="group text-normal font-medium text-emerald-600 hover:text-emerald-800 hover:underline inline-flex relative w-full"
                            target="_blank"
                          >
                            <span className="line-clamp-2 pr-1">
                              {ingredient.productName}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 inline-block align-text-top"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </Link>
                        )}
                        <Link
                          href={`/foods/${ingredient.id}`}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline break-words"
                        >
                          {ingredient.type === 'estat' ||
                          ingredient.type === 'manualPrice'
                            ? ingredient.nameInNutritionFacts
                            : '栄養成分へ'}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      {(ingredient.hectoGrams * 100).toLocaleString('ja-JP', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                      {ingredient.cost.toLocaleString('ja-JP', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {ingredient.nutritionFacts.calories.toLocaleString(
                        'ja-JP',
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                      {ingredient.nutritionFacts.protein.toLocaleString(
                        'ja-JP',
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                      {ingredient.nutritionFacts.fat.toLocaleString('ja-JP', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
                      {ingredient.nutritionFacts.carbohydrates.toLocaleString(
                        'ja-JP',
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
                      {ingredient.nutritionFacts.fiber.toLocaleString('ja-JP', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-emerald-800 bg-emerald-100/70">
                  <td className="px-4 py-3 whitespace-nowrap rounded-bl-lg">
                    合計
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    {ingredients
                      .reduce((sum, ing) => sum + ing.hectoGrams * 100, 0)
                      .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    {ingredients
                      .reduce((sum, ing) => sum + ing.cost, 0)
                      .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {ingredients
                      .reduce(
                        (sum, ing) => sum + ing.nutritionFacts.calories,
                        0
                      )
                      .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                    {ingredients
                      .reduce((sum, ing) => sum + ing.nutritionFacts.protein, 0)
                      .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                    {ingredients
                      .reduce((sum, ing) => sum + ing.nutritionFacts.fat, 0)
                      .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
                    {ingredients
                      .reduce(
                        (sum, ing) => sum + ing.nutritionFacts.carbohydrates,
                        0
                      )
                      .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell rounded-br-lg">
                    {ingredients
                      .reduce((sum, ing) => sum + ing.nutritionFacts.fiber, 0)
                      .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Mobile details - shown only on smaller screens */}
        <div className="mt-4 md:hidden">
          <h3 className="text-sm font-medium text-emerald-700 mb-2">
            詳細情報:
          </h3>
          <div className="space-y-4">
            {ingredients.map((ingredient) => (
              <div
                key={`mobile-${ingredient.id}`}
                className="bg-white/90 p-3 rounded-lg shadow-sm"
              >
                <div className="font-medium text-emerald-700 break-words">
                  {ingredient.type === 'estat'
                    ? ingredient.nameInEstat
                    : ingredient.productName}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">重量:</span>
                    <span>
                      {(ingredient.hectoGrams * 100).toLocaleString('ja-JP')}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">コスト:</span>
                    <span>{ingredient.cost.toLocaleString('ja-JP')}円</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">タンパク質:</span>
                    <span>
                      {ingredient.nutritionFacts.protein.toLocaleString(
                        'ja-JP'
                      )}
                      g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">脂質:</span>
                    <span>
                      {ingredient.nutritionFacts.fat.toLocaleString('ja-JP')}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">炭水化物:</span>
                    <span>
                      {ingredient.nutritionFacts.carbohydrates.toLocaleString(
                        'ja-JP'
                      )}
                      g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">食物繊維:</span>
                    <span>
                      {ingredient.nutritionFacts.fiber.toLocaleString('ja-JP')}g
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile totals */}
          <div className="bg-emerald-100/70 p-3 rounded-lg mt-4 font-medium text-emerald-800">
            <div className="text-center mb-2">合計</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span>重量:</span>
                <span>
                  {ingredients
                    .reduce((sum, ing) => sum + ing.hectoGrams * 100, 0)
                    .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  g
                </span>
              </div>
              <div className="flex justify-between">
                <span>コスト:</span>
                <span>
                  {ingredients
                    .reduce((sum, ing) => sum + ing.cost, 0)
                    .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  円
                </span>
              </div>
              <div className="flex justify-between">
                <span>カロリー:</span>
                <span>
                  {ingredients
                    .reduce((sum, ing) => sum + ing.nutritionFacts.calories, 0)
                    .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  kcal
                </span>
              </div>
              <div className="flex justify-between">
                <span>タンパク質:</span>
                <span>
                  {ingredients
                    .reduce((sum, ing) => sum + ing.nutritionFacts.protein, 0)
                    .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  g
                </span>
              </div>
              <div className="flex justify-between">
                <span>脂質:</span>
                <span>
                  {ingredients
                    .reduce((sum, ing) => sum + ing.nutritionFacts.fat, 0)
                    .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  g
                </span>
              </div>
              <div className="flex justify-between">
                <span>炭水化物:</span>
                <span>
                  {ingredients
                    .reduce(
                      (sum, ing) => sum + ing.nutritionFacts.carbohydrates,
                      0
                    )
                    .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  g
                </span>
              </div>
              <div className="flex justify-between">
                <span>食物繊維:</span>
                <span>
                  {ingredients
                    .reduce((sum, ing) => sum + ing.nutritionFacts.fiber, 0)
                    .toLocaleString('ja-JP', { maximumFractionDigits: 0 })}
                  g
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
