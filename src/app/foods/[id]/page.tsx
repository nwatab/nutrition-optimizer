import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import NutritionFactsTable from '@/components/nutrition-facts-table';
import NutritionRadarChart from '@/components/nutrition-radar-chart';
import CostEfficiencyChart from '@/components/cost-efficiency-chart';
import NutritionCategoryBars from '@/components/nutrition-category-bars';
import { getReferenceDailyIntakes, loadFoodData } from '@/services';

export const generateStaticParams = async () => {
  const foods = await loadFoodData();
  return foods.map((food) => ({ id: food.id }));
};

export default async function FoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const foods = await loadFoodData();
  const referenceDailyIntakes = getReferenceDailyIntakes('male', 30, 60, 2750);
  const food = foods.find((food) => food.id === id);

  if (!food) {
    notFound();
  }

  // 主要栄養素カテゴリー
  const categories = [
    { name: 'マクロ栄養素', items: ['protein', 'fat', 'carbohydrates'] },
    {
      name: 'ビタミン',
      items: [
        'vitaminA',
        'vitaminB1',
        'vitaminB2',
        'vitaminB6',
        'vitaminB12',
        'vitaminC',
        'vitaminD',
        'vitaminE',
        'vitaminK',
      ],
    },
    {
      name: 'ミネラル',
      items: ['calcium', 'iron', 'potassium', 'magnesium', 'zinc'],
    },
    {
      name: '脂肪酸',
      items: [
        'saturatedFattyAcids',
        'n6PolyunsaturatedFattyAcids',
        'n3PolyunsaturatedFattyAcids',
      ],
    },
  ];

  // 100円あたりの栄養素量を計算
  const nutritionPer100Yen = Object.entries(food.nutritionFacts).reduce(
    (acc, [key, value]) => {
      acc[key as keyof typeof food.nutritionFacts] = (value / food.cost) * 100;
      return acc;
    },
    {} as typeof food.nutritionFacts
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            {'nameInNutritionFacts' in food
              ? food.nameInNutritionFacts
              : food.productName}
          </h1>
          <p className="text-emerald-600">
            {'shokuhinbangou' in food ? (
              <a
                href={`https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=0_${food.shokuhinbangou}_8`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
              >
                食品番号:{food.shokuhinbangou}
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
            • 100gあたり{' '}
            {food.cost.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}円
          </p>
        </header>

        <div className="grid gap-8">
          {/* 食品サマリー */}
          <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                  栄養価概要
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">カロリー</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.calories.toFixed(0)} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">タンパク質</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.protein.toFixed(1)} g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">脂質</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.fat.toFixed(1)} g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">炭水化物</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {food.nutritionFacts.carbohydrates.toFixed(1)} g
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                  コスト効率
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  100円あたりの主要栄養素
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">カロリー</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {nutritionPer100Yen.calories.toFixed(0)} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">タンパク質</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {nutritionPer100Yen.protein.toFixed(1)} g
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 栄養素レーダーチャートとコスト効率 */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                栄養バランス
              </h2>
              <div className="h-80">
                <NutritionRadarChart
                  nutritionFacts={food.nutritionFacts}
                  referenceDailyIntakes={referenceDailyIntakes}
                />
              </div>
            </Card>

            <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                コスト効率
              </h2>
              <div className="h-80">
                <CostEfficiencyChart
                  nutritionPer100Yen={nutritionPer100Yen}
                  referenceDailyIntakes={referenceDailyIntakes}
                />
              </div>
            </Card>
          </div>

          {/* 栄養素カテゴリー別バー */}
          <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">
              栄養素カテゴリー
            </h2>
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.name}>
                  <h3 className="text-lg font-semibold text-emerald-700 mb-3">
                    {category.name}
                  </h3>
                  <NutritionCategoryBars
                    nutritionFacts={food.nutritionFacts}
                    items={
                      category.items as Array<keyof typeof food.nutritionFacts>
                    }
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* 詳細な栄養成分表 */}
          <Card className="p-6 backdrop-blur-sm bg-white/70 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">
              栄養成分詳細 (100gあたり)
            </h2>
            <NutritionFactsTable nutritionFacts={food.nutritionFacts} />
          </Card>
        </div>
      </div>
    </div>
  );
}
