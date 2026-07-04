import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { appConfig, type Locale } from '@/config';
import { enUS, jaJP } from '@/locales';
import { loadFoodData } from '@/services';
import { foodDisplayName } from '@/utils';

export async function generateStaticParams() {
  return appConfig.i18n.map((locale) => ({ locale }));
}

// 食品一覧ページ
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <Link key={food.id} href={`/${params.locale}/foods/${food.id}`}>
              <Card className="h-full transition-all hover:shadow-md hover:border-emerald-300">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-emerald-800 mb-2">
                    {foodDisplayName(food, params.locale)}
                  </h2>
                  <p className="text-emerald-600">
                    {messages['per 100 g edible portion']}{' '}
                    {food.cost.toLocaleString(params.locale, {
                      maximumFractionDigits: 1,
                    })}
                    {messages.yen}
                  </p>
                  <div className="font-medium mt-4 text-sm text-gray-500">
                    {messages['See details']} →
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
