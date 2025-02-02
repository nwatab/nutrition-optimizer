import { solve } from "yalps";

export default async function DietPage() {
  // 最適化を実行する関数
  async function optimizeDiet() {
    // 1日に必要な栄養素の量
    const minCalories = 2700; // kcal
    const minProtein = 65;    // g
    const minFiber = 21;      // g

    // 各食材の栄養素データとコスト. 100gあたりの値を使用
    const foods = [
      { name: "白米", cost: 15390 / 60000*100, calories: 342, protein: 6.2, fiber: 0.4 },
      { name: "蕎麦の実", cost: 1850/1000*100, calories: 347, protein: 9.6, fiber: 3.7 },
      { name: "大豆 黄 乾", cost: 1050/900*100, calories: 372, protein: 33.8, fiber: 21.5 }
    ];


    const model = {
      direction: "minimize" as const,
      objective: "cost",
      constraints: {
        calories: { min: minCalories },
        protein: { min: minProtein },
        fiber: { min: minFiber }
      },
      variables: {} as { [key: string]: { cost: number; calories: number; protein: number; fiber: number } }
    };

    // foods 配列から各食材をモデルの変数として追加
    for (const food of foods) {
      model.variables[food.name] = {
        cost: food.cost,
        calories: food.calories,
        protein: food.protein,
        fiber: food.fiber
      };
    }

    // 最適化を実行
    const solution = solve(model);
    // solution の形式は以下のようなオブジェクトになります:
    // {
    //   status: "optimal",
    //   result: <最終的な目的関数の値>,
    //   variables: [ [変数名, 値], ... ]
    // }

    // 結果をフォーマットして返す
    return {
      cost: solution.result.toFixed(2),
      amounts: solution.variables.map(([name, value]) => ({
        name,
        amount: value.toFixed(2)
      }))
    };
  }

  // サーバー側で最適化を実行
  const { cost, amounts } = await optimizeDiet();

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">最適な食材の組み合わせ</h1>
      <p className="mb-2">
        総コスト: <strong>¥{cost}</strong>
      </p>
      <h2 className="text-xl font-semibold mt-4 mb-2">購入量:</h2>
      <ul className="list-disc list-inside">
        {amounts.map(({ name, amount }) => (
          <li key={name}>
            {name}: {amount} g
          </li>
        ))}
      </ul>
    </main>
  );
}
