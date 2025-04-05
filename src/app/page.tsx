import IngredientsList from '@/components/ingredients-list';
import NutritionCategoryCharts from '@/components/nutrition-category-charts';
import NutritionSummary from '@/components/nutrition-summary';

import ThemeImage from '@/components/theme-image';
import { loadFoodData, optimizeDiet, referenceDailyIntakes } from '@/services';
import Link from 'next/link';

export default async function DietPage() {
  const foods = await loadFoodData();
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
            男性, 30代, 運動量普通
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
