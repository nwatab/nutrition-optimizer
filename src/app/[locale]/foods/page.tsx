import { Suspense } from 'react';

import FoodList from '@/components/food-list';
import { appConfig, type Locale } from '@/config';
import { enUS, jaJP } from '@/locales';
import { loadFoodData } from '@/services';

export async function generateStaticParams() {
  return appConfig.i18n.map((locale) => ({ locale }));
}

// 食品一覧ページ。100gあたりの各指標で並べ替えられる表。
export default async function FoodListPage({
  params: paramsPromise,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const params = await paramsPromise;
  const messages = params.locale === 'ja-JP' ? jaJP : enUS;
  const foods = await loadFoodData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            {messages['Food nutrition database']}
          </h1>
          <p className="text-emerald-600">
            {messages['Browse detailed nutrition and cost efficiency of each food']}
          </p>
        </header>

        {/* useSearchParams（order / order_by）を使うため Suspense 境界が必要 */}
        <Suspense>
          <FoodList
            foods={foods}
            messages={messages}
            locale={params.locale}
          />
        </Suspense>
      </div>
    </div>
  );
}
