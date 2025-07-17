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
  const weights = ['50', '55', '60', '65', '70'] as const;
  const heights = ['150', '160', '170'] as const;
  const ages = ['25', '35', '45'] as const;
  const palCategories = ['low', 'normal', 'high'] as const;

  const filters = sexes.flatMap((sex) =>
    weights.flatMap((weight) =>
      heights.flatMap((height) =>
        ages.flatMap((age) =>
          palCategories.flatMap((pal_category) =>
            appConfig.i18n.flatMap((locale) => ({
              sex,
              weight,
              height,
              age,
              pal_category,
              locale,
            }))
          )
        )
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
    height: string;
    age: string;
    pal_category: 'low' | 'normal' | 'high';
    locale: Locale;
  }>;
}) {
  const foods = await loadFoodData();
  const params = await paramsPromise;
  const dailyCalory = getDailyCaloryGoal(
    params.sex,
    parseInt(params.age, 10),
    parseInt(params.weight, 10),
    params.pal_category
  );
  const referenceDailyIntakes = getReferenceDailyIntakes(
    params.sex,
    parseInt(params.age, 10),
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
            : {messages[params.sex]}, {params.weight}kg, {params.height}cm, {params.age}{messages['years old']}, {messages['physical activity level']}{' '}
            {messages[params.pal_category]} ({dailyCalory} kcal/日)
          </p>
        </header>

        <div className="grid gap-8">
          <NutritionSummary
            totalCost={totalCost}
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
            messages={messages}
          />

          <IngredientsList ingredients={breakdown} messages={messages} />
          <IngredientsListDetail
            ingredients={breakdown}
            referenceDailyIntakes={referenceDailyIntakes}
            messages={messages}
          />
          <NutritionCategoryCharts
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
            breakdown={breakdown}
            messages={messages}
          />
        </div>
      </div>
    </div>
  );
}
