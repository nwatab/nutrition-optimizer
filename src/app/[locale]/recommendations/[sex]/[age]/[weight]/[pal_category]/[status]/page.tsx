import IngredientsList from '@/components/ingredients-list';
import IngredientsListDetail from '@/components/ingredients-list-detail';
import NutritionCategoryCharts from '@/components/nutrition-category-charts';
import NutritionSummary from '@/components/nutrition-summary';

import {
  appConfig,
  AGE_SEGMENTS,
  CHILD_WEIGHT_SEGMENT,
  WEIGHT_OPTIONS_KG,
  isChildSegment,
  palCategoriesFor,
  statusesFor,
  type StatusSegment,
} from '@/config';
import type { Locale } from '@/config';
import { MaternalStatus, PalCategory, Sex, childReferenceWeight } from '@/data';
import { enUS, jaJP } from '@/locales';
import { loadFoodData, optimizeDiet, buildTarget } from '@/services';

/**
 * [status] セグメント → 月経有無 + 妊娠授乳状態への変換。
 * 'menstruation' は月経ありの女性、妊娠授乳は付加量に反映する。
 */
const parseStatus = (
  status: StatusSegment
): { menstruation: boolean; maternalStatus: MaternalStatus } => {
  if (status === 'menstruation')
    return { menstruation: true, maternalStatus: 'none' };
  if (status === 'none') return { menstruation: false, maternalStatus: 'none' };
  return { menstruation: false, maternalStatus: status };
};

export async function generateStaticParams() {
  const sexes: Sex[] = ['male', 'female'];
  const ageSegments = Object.keys(AGE_SEGMENTS);

  return sexes.flatMap((sex) =>
    ageSegments.flatMap((age) => {
      const ageBand = AGE_SEGMENTS[age];
      // 小児は参照体重を用いるため体重を掛け合わせない（区分ごとに1トークン）。
      const weights = isChildSegment(age)
        ? [CHILD_WEIGHT_SEGMENT]
        : WEIGHT_OPTIONS_KG.map(String);
      const palCategories = palCategoriesFor(age);
      return weights.flatMap((weight) =>
        palCategories.flatMap((pal_category) =>
          statusesFor(sex, ageBand).flatMap((status) =>
            appConfig.i18n.flatMap((locale) => ({
              sex,
              age,
              weight,
              pal_category,
              status,
              locale,
            }))
          )
        )
      );
    })
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
    status: StatusSegment;
    locale: Locale;
  }>;
}) {
  const foods = await loadFoodData();
  const params = await paramsPromise;

  const ageBand = AGE_SEGMENTS[params.age] ?? '30-49';
  const { menstruation, maternalStatus } = parseStatus(params.status);
  // 小児は参照体重で算定し、URL の体重は用いない。
  const weightKg = isChildSegment(params.age)
    ? childReferenceWeight[ageBand]![params.sex]
    : parseInt(params.weight, 10);

  const referenceDailyIntakes = buildTarget({
    ageBand,
    sex: params.sex,
    weightKg,
    pal: params.pal_category,
    menstruation,
    maternalStatus,
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
