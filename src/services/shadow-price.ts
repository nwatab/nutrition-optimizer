import type { FoodToOptimize, NutritionTarget } from '@/types/nutrition';
import type { NutrientKey } from '@/services/diagnose';
import { density, type Basis } from '@/services/nutrient-density';
import { optimizeDiet } from '@/services/optimizer';

/**
 * min 制約を持つ栄養素ごとの影価格（円 / 単位量）。
 * 解けなかった摂動（infeasible 等）は null。
 */
export type ShadowPrices = Partial<Record<NutrientKey, number | null>>;

const minConstrainedKeys = (target: NutritionTarget): NutrientKey[] =>
  (Object.keys(target) as NutrientKey[]).filter(
    (key) => 'min' in target[key]
  );

const withPerturbedMin = (
  target: NutritionTarget,
  key: NutrientKey,
  delta: number
): NutritionTarget => {
  const constraint = target[key];
  if (!('min' in constraint)) {
    throw new Error(`min 制約がありません: ${key}`);
  }
  return {
    ...target,
    [key]: { ...constraint, min: constraint.min + delta },
  };
};

/**
 * min 制約 key の影価格を RHS 摂動の片側（前進）差分で求める。
 * YALPS は双対解を返さないため、min を δ だけ引き上げて再solveし
 * y = (cost' - base) / δ とする。
 *
 * 退化解では左右の差分が一致しない（影価格が区間になる）ため、
 * 両側差分に拡張できるよう単一方向の差分を関数として分離している。
 * direction: 'forward' は min+δ、'backward' は min-δ を意味する。
 */
export const shadowPriceOneSided = (
  foods: FoodToOptimize[],
  target: NutritionTarget,
  key: NutrientKey,
  baseCost: number,
  direction: 'forward' | 'backward' = 'forward'
): number | null => {
  const constraint = target[key];
  if (!('min' in constraint)) return null;

  const magnitude = Math.max(Math.abs(constraint.min) * 1e-3, 1e-6);
  const delta = direction === 'forward' ? magnitude : -magnitude;
  try {
    const perturbed = optimizeDiet(foods, withPerturbedMin(target, key, delta));
    return (perturbed.totalCost - baseCost) / delta;
  } catch {
    return null;
  }
};

/**
 * 全 min 制約の影価格 y_i を求める。
 * ビルド時計算を想定しており、制約の数だけ LP を再solveする。
 */
export const computeShadowPrices = (
  foods: FoodToOptimize[],
  target: NutritionTarget
): ShadowPrices => {
  const baseCost = optimizeDiet(foods, target).totalCost;
  return Object.fromEntries(
    minConstrainedKeys(target).map((key) => [
      key,
      shadowPriceOneSided(foods, target, key, baseCost),
    ])
  );
};

export type ComplementScore = {
  food: FoodToOptimize;
  /**
   * score = Σ_i y_i · nutrition_i(food) / denominator(food)
   * 不足栄養素ほど y_i が大きいので、それを安く供給する食材が上位に来る。
   */
  score: number;
};

/**
 * 「何を足すか」の補完提案。影価格で重み付けした栄養密度が
 * 高い順に食材を並べる。分母は basis（perYen / perKcal）で選ぶ。
 * その basis で密度が定義できない食材（perKcal かつ低カロリー等）は score 0。
 */
export const scoreComplements = (
  foods: FoodToOptimize[],
  shadowPrices: ShadowPrices,
  basis: Basis = 'perYen'
): ComplementScore[] =>
  foods
    .map((food) => ({
      food,
      score: Object.entries(shadowPrices).reduce((acc, [key, price]) => {
        if (price === null || price === undefined) return acc;
        const nutrientDensity = density(food, basis, key as NutrientKey);
        return nutrientDensity === undefined
          ? acc
          : acc + price * nutrientDensity;
      }, 0),
    }))
    .toSorted((a, b) => b.score - a.score);
