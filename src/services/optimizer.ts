import {
  scalarizeCost,
  type ScalarizationWeights,
} from '@/services/domination';
import { environmentalImpactOf } from '@/services/environment';
import type {
  FoodRequired,
  FoodToOptimize,
  NutritionFactBase,
  NutritionTarget,
} from '@/types/nutrition';
import { solve } from 'yalps';

const ZERO_WEIGHTS: ScalarizationWeights = {
  yenPerKgCo2e: 0,
  yenPerM2Land: 0,
  yenPerLWater: 0,
};

/** 可食部100gあたりの環境負荷（データは1kgあたりのため 1/10 する） */
const environmentPerHectogram = (food: FoodToOptimize) => {
  const env = environmentalImpactOf(food);
  return {
    co2eKg: env.co2eKgPerKg / 10,
    landM2: env.landM2PerKg / 10,
    waterL: env.waterLPerKg / 10,
  };
};

/**
 * 目的関数は 円 + 環境負荷の円換算（weights はユーザー設定）。
 * 既定は 0 で、そのときは従来どおり価格のみの最小化になる。
 */
export function optimizeDiet(
  foods: FoodToOptimize[],
  target: NutritionTarget,
  weights: ScalarizationWeights = ZERO_WEIGHTS
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
          cost: scalarizeCost(
            { yen: food.cost, ...environmentPerHectogram(food) },
            weights
          ),
        };
        return acc;
      },
      {} as { [key: string]: NutritionFactBase<number> & { cost: number } }
    ),
  };

  const solution = solve(model);
  if (solution.status !== 'optimal') {
    throw new Error(`最適化に失敗しました: ${solution.status}`);
  }
  // solution の形式は以下のようなオブジェクトになります:
  // {
  //   status: "optimal",
  //   result: <最終的な目的関数の値>,
  //   variables: [ [変数名, 値], ... ]
  // }

  // 各食材の購入量と費用内訳を計算する
  // ※変数の値は「100g単位」としているので、最終的なグラム数は value * 100
  const breakdown: FoodRequired[] = solution.variables
    .map(([id, hectoGrams]) => {
      const food = foods.find((f) => f.id === id);
      if (!food) return null;
      const { cost: costPerHectogram, nutritionFacts, ...others } = food;
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
        cost: costPerHectogram * hectoGrams,
        nutritionFacts: nutritionFactsRequired,
        ...others,
      };
    })
    .filter((food) => food !== null)
    .toSorted((a, b) => b.cost - a.cost);

  // オブジェクトの値を合計する汎用関数
  function mergeObjects<T extends Record<string, number>>(
    obj1: T,
    obj2: Partial<T>
  ): T {
    const result = { ...obj1 };

    for (const [key, value] of Object.entries(obj2)) {
      const typedKey = key as keyof T;
      result[typedKey] = (result[typedKey] || 0) + value;
    }
    return result;
  }

  const totalNutritionFacts = breakdown.reduce(
    (acc, food) => mergeObjects(acc, food.nutritionFacts),
    {} as NutritionFactBase<number>
  );

  // 円の支出と環境負荷の合計。totalCost（目的関数値）は
  // totalYen + weights·environmentalTotals に一致する。
  const totalYen = breakdown.reduce((sum, food) => sum + food.cost, 0);
  const environmentalTotals = solution.variables.reduce(
    (acc, [id, hectoGrams]) => {
      const food = foods.find((f) => f.id === id);
      if (!food) return acc;
      const env = environmentPerHectogram(food);
      return {
        co2eKg: acc.co2eKg + env.co2eKg * hectoGrams,
        landM2: acc.landM2 + env.landM2 * hectoGrams,
        waterL: acc.waterL + env.waterL * hectoGrams,
      };
    },
    { co2eKg: 0, landM2: 0, waterL: 0 }
  );

  return {
    status: solution.status,
    totalCost: solution.result,
    totalYen,
    environmentalTotals,
    totalNutritionFacts,
    breakdown,
  };
}
