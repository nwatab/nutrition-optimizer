import { ManualFoodData, NutritionFactAndCost, NutritionTarget } from '@/types';
import { solve } from 'yalps';

export async function optimizeDiet(
  foods: ManualFoodData[],
  target: NutritionTarget
) {
  // モデルの作成
  const model = {
    direction: 'minimize' as const,
    objective: 'cost',
    constraints: target,
    variables: {} as {
      [key: string]: NutritionFactAndCost;
    },
  };

  // foods 配列から各食材をモデルの変数として追加
  // ※各変数は「100gあたり」の値をもとにしています
  for (const food of foods) {
    model.variables[food.name] = food;
  }

  // 最適化を実行
  const solution = solve(model);
  // solution の形式は以下のようなオブジェクトになります:
  // {
  //   status: "optimal",
  //   result: <最終的な目的関数の値>,
  //   variables: [ [変数名, 値], ... ]
  // }

  // 各食材の購入量と費用内訳を計算する
  // ※変数の値は「100g単位」としているので、最終的なグラム数は value * 100
  const breakdown = solution.variables.map(([name, value]) => {
    const food = foods.find((f) => f.name === name);
    if (!food) return { name, grams: 0, cost: 0 };
    const grams = value * 100; // 100g単位 → グラムに変換
    const foodCost = value * food.cost; // 各食材の合計費用
    return {
      name,
      grams: grams,
      cost: foodCost,
    };
  });

  return {
    status: solution.status,
    totalCost: solution.result,
    breakdown,
  };
}
