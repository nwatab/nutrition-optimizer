import IngredientsList from '@/components/ingredients-list';
import IngredientsListDetail from '@/components/ingredients-list-detail';
import NutritionCategoryCharts from '@/components/nutrition-category-charts';
import NutritionSummary from '@/components/nutrition-summary';

import ThemeImage from '@/components/theme-image';
import {
  loadFoodData,
  optimizeDiet,
  getReferenceDailyIntakes,
  getDailyCaloryGoal,
} from '@/services';
import Link from 'next/link';
export async function generateStaticParams() {
  const sexes = ['male', 'female'] as const;
  const weights = Array.from({ length: 1 }, (_, i) => 50 + i * 5).map((i) =>
    String(i)
  ); // [50,55,…,95]
  const palCategories = ['low', 'normal', 'high'] as const;

  const filters = sexes.flatMap((sex) =>
    weights.flatMap((weight) =>
      palCategories.map((pal_category) => ({ sex, weight, pal_category }))
    )
  );

  return filters;
}

export default async function RecommendationPage({
  params,
}: {
  params: Promise<{
    sex: 'male' | 'female';
    weight: string;
    pal_category: 'low' | 'normal' | 'high';
  }>;
}) {
  const foods = await loadFoodData();
  const pathParams = await params;
  const dailyCalory = getDailyCaloryGoal(
    parseInt(pathParams.weight, 10),
    pathParams.pal_category
  );
  const referenceDailyIntakes = getReferenceDailyIntakes(
    pathParams.sex,
    0,
    parseInt(pathParams.weight, 10),
    dailyCalory
  );
  const { totalCost, totalNutritionFacts, breakdown } = optimizeDiet(
    foods,
    referenceDailyIntakes
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center relative">
          <div className="absolute right-0 top-0">
            <Link
              href="https://github.com/nwatab/nutrition-optimizer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <ThemeImage
                srcLight="/github-mark.svg"
                srcDark="/github-mark-white.svg"
                alt="GitHub"
                width={24}
                height={24}
              />
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            栄養最適化の結果
          </h1>
          <p className="text-emerald-600">
            栄養バランスを最適化し、コストを最小限に抑えた食材の組み合わせです。対象:
            男性, 30代, 運動量普通, Vegan
          </p>
        </header>

        <div className="grid gap-8">
          {/* 総合サマリー */}
          <NutritionSummary
            totalCost={totalCost}
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
          />

          {/* 食材リスト */}
          <IngredientsList ingredients={breakdown} />
          <IngredientsListDetail
            ingredients={breakdown}
            referenceDailyIntakes={referenceDailyIntakes}
          />
          {/* 栄養素カテゴリー別チャート */}
          <NutritionCategoryCharts
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
            breakdown={breakdown}
          />
        </div>
      </div>
    </div>
  );
}
