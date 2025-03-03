import { foods } from '@/data';
import { optimizeDiet, referenceDailyIntakes } from '@/services';

export default async function DietPage() {
  // サーバー側で最適化を実行
  const { totalCost, breakdown } = await optimizeDiet(
    foods,
    referenceDailyIntakes
  );

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        ビーガン向け1日に最適な食材の組み合わせ
        (33-49歳、身体活動レベルふつう、男性)
      </h1>
      <p className="mb-2">
        総コスト: <strong>¥{Math.ceil(totalCost)}</strong>
      </p>
      <h2 className="text-xl font-semibold mt-4 mb-2">購入量と金額内訳:</h2>
      <ul className="list-disc list-inside">
        {breakdown.map(({ name, grams, cost }) => (
          <li key={name}>
            {name}: ¥{Math.round(cost)} / {grams.toFixed(2)} g
          </li>
        ))}
      </ul>
    </main>
  );
}
