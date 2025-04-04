import {
  EstatPriceFoodData,
  ManualFoodData,
  ManualPriceFoodData,
  NutritionFactBase,
  NutritionTarget,
} from '@/types';
import { solve } from 'yalps';

export async function optimizeDiet(
  foods: (
    | (ManualFoodData & { id: string; type: 'manual' })
    | (EstatPriceFoodData & { id: string; type: 'estat' })
    | (ManualPriceFoodData & { id: string; type: 'manualPrice' })
  )[],
  target: NutritionTarget
) {
  // モデルの作成
  const model = {
    direction: 'minimize' as const,
    objective: 'cost',
    constraints: target,
    // foods 配列から各食材をモデルの変数として追加
    // ※各変数は「100gあたり」の値をもとにしています
    variables: foods.reduce(
      (acc, food) => {
        acc[food.id] = {
          ...food.nutritionFacts,
          cost: food.cost,
        };
        return acc;
      },
      {} as { [key: string]: NutritionFactBase<number> & { cost: number } }
    ),
  };

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
  const breakdown = solution.variables
    .map(([id, hectoGrams]) => {
      const food = foods.find((f) => f.id === id);
      if (!food) return null;
      const { cost, nutritionFacts, ...others } = food;
      const nutritionFactsRequired = Object.fromEntries(
        Object.entries(nutritionFacts).map(([key, value]) => [
          key,
          value * hectoGrams,
        ])
      ) as NutritionFactBase<number>;
      return {
        /**
         * 食材の必要な量 単位は[100g]
         */
        hectoGrams,
        /**
         * 食材の費用 [円]
         */
        cost: hectoGrams * cost,
        nutritionFacts: nutritionFactsRequired,
        ...others,
      };
    })
    .filter((food) => food !== null);

  return {
    status: solution.status,
    totalCost: solution.result,
    breakdown,
  };
}
