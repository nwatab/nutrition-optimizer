import { foods } from '@/data';
import { optimizeDiet } from '@/services';
import { NutritionFacts } from '@/types';

export default async function DietPage() {
  // 1日に必要な栄養素の量
  const referenceDailyIntakes: NutritionFacts = {
    calories: 2700, // kcal
    protein: 65, // g
    fat: (2700 * 0.2) / 9, // g. 脂質単位gあたりのエネルギー = 9kcal/g. 脂質は全エネルギーの20%と仮定
    fiber: 21, // g
    vitaminB12: 2.4, // μg
    vitaminC: 100, // mg
  };

  // サーバー側で最適化を実行
  const { totalCost, breakdown } = await optimizeDiet(
    foods,
    referenceDailyIntakes
  );

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">1日に最適な食材の組み合わせ</h1>
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
