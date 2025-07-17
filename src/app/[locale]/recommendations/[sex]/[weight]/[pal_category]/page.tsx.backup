import IngredientsList from '@/components/ingredients-list';
import IngredientsListDetail from '@/components/ingredients-list-detail';
import NutritionCategoryCharts from '@/components/nutrition-category-charts';
import NutritionSummary from '@/components/nutrition-summary';

import { appConfig } from '@/config';
import type { Locale } from '@/config';
import { enUS, jaJP } from '@/locales';
import {
  loadFoodData,
  optimizeDiet,
  getReferenceDailyIntakes,
  getDailyCaloryGoal,
} from '@/services';

export async function generateStaticParams() {
  const sexes = ['male', 'female'] as const;

  const weights = ['50', '55'] as const; // [50,55,…,95]
  const palCategories = ['low', 'normal', 'high'] as const;

  const filters = sexes.flatMap((sex) =>
    weights.flatMap((weight) =>
      palCategories.flatMap((pal_category) =>
        appConfig.i18n.flatMap((locale) => ({
          sex,
          weight,
          pal_category,
          locale,
        }))
      )
    )
  );

  return filters;
}

export default async function RecommendationPage({
  params: paramsPromise,
}: {
  params: Promise<{
    sex: 'male' | 'female';
    weight: string;
    pal_category: 'low' | 'normal' | 'high';
    locale: Locale;
  }>;
}) {
  const foods = await loadFoodData();
  const params = await paramsPromise;
  const dailyCalory = getDailyCaloryGoal(
    parseInt(params.weight, 10),
    params.pal_category
  );
  const referenceDailyIntakes = getReferenceDailyIntakes(
    params.sex,
    0,
    parseInt(params.weight, 10),
    dailyCalory
  );
  const { totalCost, totalNutritionFacts, breakdown } = optimizeDiet(
    foods,
    referenceDailyIntakes
  );
  const messages = params.locale === 'ja-JP' ? jaJP : enUS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            {messages.Recommendations}
          </h1>
          <p className="text-emerald-600">
            {
              messages[
                'This is the result of calculation of your diet for cost and nutrition'
              ]
            }
            : {messages.male}, {messages['physical activity level']}{' '}
            {messages['normal']}
          </p>
        </header>

        <div className="grid gap-8">
          {/* 総合サマリー */}
          <NutritionSummary
            totalCost={totalCost}
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
            messages={messages}
          />

          {/* 食材リスト */}
          <IngredientsList ingredients={breakdown} messages={messages} />
          <IngredientsListDetail
            ingredients={breakdown}
            referenceDailyIntakes={referenceDailyIntakes}
            messages={messages}
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
