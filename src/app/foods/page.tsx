import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

// 食品一覧ページ
export default async function FoodListPage() {
  // 実際の実装では、すべての食品データを取得する
  const foods = [
    { id: '1', name: '鶏肉（むね、皮なし）', cost: 100 },
    { id: '2', name: '豚肉（ロース）', cost: 200 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2">
            食品栄養データベース
          </h1>
          <p className="text-emerald-600">
            各食品の詳細な栄養情報とコスト効率を確認できます
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <Link key={food.id} href={`/food/${food.id}`}>
              <Card className="h-full transition-all hover:shadow-md hover:border-emerald-300">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-emerald-800 mb-2">
                    {food.name}
                  </h2>
                  <p className="text-emerald-600">100gあたり {food.cost}円</p>
                  <div className="font-medium mt-4 text-sm text-gray-500">
                    詳細を見る →
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
