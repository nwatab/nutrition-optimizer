import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import FoodDominationCard from '@/components/food-domination-card';
import NutritionFactsTable from '@/components/nutrition-facts-table';
import NutritionRadarChart from '@/components/nutrition-radar-chart';
import CostEfficiencyChart from '@/components/cost-efficiency-chart';
import NutritionCategoryBars from '@/components/nutrition-category-bars';
import { buildTarget, loadFoodData } from '@/services';
import { appConfig, Locale } from '@/config';
import { enUS, jaJP } from '@/locales';
import { isPriced } from '@/types/nutrition';
import { foodDisplayName, foodNutritionFactsName } from '@/utils';

export async function generateStaticParams() {
  const foods = await loadFoodData();
  return foods.flatMap((food) =>
    appConfig.i18n.map((locale) => ({ id: food.id, locale }))
  );
}

export default async function FoodPage({
  params,
}: {
  params: Promise<{ id: string; locale: Locale }>;
}) {
  const { id, locale } = await params;
  const foods = await loadFoodData();
  // 代表プロフィールの基準量。詳細ページは静的生成のため全閲覧者共通で、
  // 性別で基準が大きく変わる鉄・カルシウムはレーダーチャートが女性基準を併記する。
  const referenceDailyIntakes = buildTarget({
    ageBand: '30-49',
    sex: 'male',
    weightKg: 60,
    pal: 'normal',
  });
  const femaleReferenceDailyIntakes = buildTarget({
    ageBand: '30-49',
    sex: 'female',
    weightKg: 53,
    pal: 'normal',
    menstruation: true,
  });
  const food = foods.find((food) => food.id === id);
  const messages = locale === 'ja-JP' ? jaJP : enUS;

  if (!food) {
    notFound();
  }

  // 価格なし食材（mext）はコスト系の表示・比較を出さない。比較対象も価格ありのみ。
  const priced = isPriced(food);
  const pricedFoods = foods.filter(isPriced);

  // 100円あたりの栄養素量（価格がある食材のみ）
  const nutritionPer100Yen = priced
    ? Object.entries(food.nutritionFacts).reduce(
        (acc, [key, value]) => {
          acc[key as keyof typeof food.nutritionFacts] =
            (value / food.cost) * 100;
          return acc;
        },
        {} as typeof food.nutritionFacts
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            {foodNutritionFactsName(food, locale) ??
              foodDisplayName(food, locale)}
          </h1>
          <p className="text-emerald-600">
            {'shokuhinbangou' in food ? (
              <a
                href={`https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=0_${food.shokuhinbangou}_8`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
              >
                {messages['Food item number']}:{food.shokuhinbangou}
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
              </a>
            ) : (
              ''
            )}{' '}
            • {messages['per 100 g edible portion']}
            {food.cost === null
              ? ` ・ ${messages['no market price']}`
              : ` ${food.cost.toLocaleString(locale, {
                  maximumFractionDigits: 1,
                })}${messages.yen}`}
          </p>
          {/* 一覧の短縮名では消える原題と購入元。価格の出所を辿れるようにする。
              estat には url が無いため manual/manualPrice のみ。 */}
          {'url' in food && (
            <p className="mt-1 text-sm text-gray-500">
              {messages['reference product']}：
              <a
                href={food.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-800 hover:underline"
              >
                {food.productName}
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
              </a>
            </p>
          )}
        </header>

        <div className="grid gap-8">
          {/* 食品サマリー */}
          <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                  {messages['Nutrition overview']}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{messages.calories}</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.calories.toFixed(0)} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{messages.protein}</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.protein.toFixed(1)} g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{messages.fat}</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.fat.toFixed(1)} g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {messages.carbohydrates}
                    </p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.carbohydrates.toFixed(1)} g
                    </p>
                  </div>
                </div>
              </div>
              {nutritionPer100Yen && (
                <div>
                  <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                    {messages['Cost efficiency']}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {messages['Key nutrients per 100 yen']}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {messages.calories}
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {nutritionPer100Yen.calories.toFixed(0)} kcal
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {messages.protein}
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {nutritionPer100Yen.protein.toFixed(1)} g
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* コスト・栄養トレードオフ上の位置（局所半順序）。価格ありのみ。 */}
          {isPriced(food) && (
            <FoodDominationCard
              food={food}
              foods={pricedFoods}
              messages={messages}
              locale={locale}
            />
          )}

          {/* 栄養素レーダーチャートとコスト効率 */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                {messages['Nutrition balance']}
              </h2>
              <div className="h-80">
                <NutritionRadarChart
                  nutritionFacts={food.nutritionFacts}
                  targets={{
                    male: referenceDailyIntakes,
                    female: femaleReferenceDailyIntakes,
                  }}
                  messages={messages}
                />
              </div>
            </Card>

            {isPriced(food) && (
              <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                  {messages['Cost efficiency']}
                </h2>
                <div className="h-80">
                  <CostEfficiencyChart
                    nutritionFacts={food.nutritionFacts}
                    cost={food.cost}
                    referenceDailyIntakes={referenceDailyIntakes}
                    messages={messages}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* 栄養素カテゴリー別バー */}
          <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">
              {messages['Nutrient categories']}
            </h2>
            <NutritionCategoryBars
              nutritionFacts={food.nutritionFacts}
              targets={{
                male: referenceDailyIntakes,
                female: femaleReferenceDailyIntakes,
              }}
              messages={messages}
              locale={locale}
            />
          </Card>

          {/* 詳細な栄養成分表 */}
          <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">
              {messages['Nutrition facts (per 100 g)']}
            </h2>
            <NutritionFactsTable
              nutritionFacts={food.nutritionFacts}
              messages={messages}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
