import { Suspense } from 'react';

import FoodComparison from '@/components/food-comparison';
import { appConfig, type Locale } from '@/config';
import { enUS, jaJP } from '@/locales';
import { loadFoodData } from '@/services';

export async function generateStaticParams() {
  return appConfig.i18n.map((locale) => ({ locale }));
}

// 食材比較ページ: コストベクトル (円, CO2e, 土地, 水) 上の半順序。
// デフォルトは Pareto（Hasse 図・比較不能を保持）、スカラー化は任意。
export default async function ComparePage({
  params: paramsPromise,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const params = await paramsPromise;
  const foods = await loadFoodData();
  const messages = params.locale === 'ja-JP' ? jaJP : enUS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            {messages['Compare foods for wallet and environment']}
          </h1>
          <p className="text-emerald-600">
            {messages['compare page description']}
          </p>
        </header>
        {/* useSearchParams（?highlight=）を使うため Suspense 境界が必要 */}
        <Suspense>
          <FoodComparison
            foods={foods}
            messages={messages}
            locale={params.locale}
          />
        </Suspense>
      </div>
    </div>
  );
}
