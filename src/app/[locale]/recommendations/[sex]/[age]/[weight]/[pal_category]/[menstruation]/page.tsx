import IngredientsList from '@/components/ingredients-list';
import IngredientsListDetail from '@/components/ingredients-list-detail';
import NutritionCategoryCharts from '@/components/nutrition-category-charts';
import NutritionSummary from '@/components/nutrition-summary';

import { appConfig, AGE_SEGMENTS, WEIGHT_OPTIONS_KG } from '@/config';
import type { Locale } from '@/config';
import { PalCategory, Sex } from '@/data';
import { enUS, jaJP } from '@/locales';
import { loadFoodData, optimizeDiet, buildTarget } from '@/services';

export async function generateStaticParams() {
  const sexes = ['male', 'female'] as const;
  const ages = Object.keys(AGE_SEGMENTS);
  const weights = WEIGHT_OPTIONS_KG.map(String);
  const palCategories = ['low', 'normal', 'high'] as const;

  return sexes.flatMap((sex) =>
    ages.flatMap((age) =>
      weights.flatMap((weight) =>
        palCategories.flatMap((pal_category) =>
          // 月経ありは女性のみ生成する（男性では鉄の下限に影響しない）。
          (sex === 'female'
            ? (['none', 'present'] as const)
            : (['none'] as const)
          ).flatMap((menstruation) =>
            appConfig.i18n.flatMap((locale) => ({
              sex,
              age,
              weight,
              pal_category,
              menstruation,
              locale,
            }))
          )
        )
      )
    )
  );
}

export default async function RecommendationPage({
  params: paramsPromise,
}: {
  params: Promise<{
    sex: Sex;
    age: string;
    weight: string;
    pal_category: PalCategory;
    menstruation: 'none' | 'present';
    locale: Locale;
  }>;
}) {
  const foods = await loadFoodData();
  const params = await paramsPromise;

  const referenceDailyIntakes = buildTarget({
    ageBand: AGE_SEGMENTS[params.age] ?? '30-49',
    sex: params.sex,
    weightKg: parseInt(params.weight, 10),
    pal: params.pal_category,
    menstruation: params.menstruation === 'present',
  });

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
            : {messages[params.sex]}, {messages['physical activity level']}{' '}
            {messages[params.pal_category]}
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
          <IngredientsList
            ingredients={breakdown}
            messages={messages}
            locale={params.locale}
          />
          <IngredientsListDetail
            ingredients={breakdown}
            referenceDailyIntakes={referenceDailyIntakes}
            messages={messages}
            locale={params.locale}
          />
          {/* 栄養素カテゴリー別チャート */}
          <NutritionCategoryCharts
            totalNutrition={totalNutritionFacts}
            target={referenceDailyIntakes}
            breakdown={breakdown}
            messages={messages}
            locale={params.locale}
          />
        </div>
      </div>
    </div>
  );
}
