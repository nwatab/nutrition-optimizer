import type { NutritionFactBase } from '@/types/nutrition';

/**
 * 比較ビュー用のコスト分母。LP（optimizer.ts）の目的関数は円のままで、
 * この抽象化は比較ビュー専用。
 */
export type Basis = 'per100g' | 'perKcal' | 'perYen';

/**
 * perKcal を計算する最小カロリー [kcal/可食部100g]。
 * 水・寒天・こんにゃく（5 kcal）等の calories≈0 の食材はゼロ割で
 * 密度が発散するため、これ以下は perKcal を undefined として比較から除外する。
 */
export const PER_KCAL_MIN_CALORIES = 5;

export type FoodDensitySource = {
  /**
   * 可食部100gあたりの栄養成分
   */
  nutritionFacts: NutritionFactBase<number>;
  /**
   * 可食部100gあたりの金額 [円]
   */
  cost: number;
};

/**
 * 指定した分母での栄養素密度を返す。
 * - per100g: 可食部100gあたり（現行の表示と同じ）
 * - perYen: 1円あたり
 * - perKcal: 1kcalあたり。calories が PER_KCAL_MIN_CALORIES 以下の食材は undefined
 *
 * undefined は「この分母では比較不能」を意味し、呼び出し側で除外できる。
 */
export const density = (
  food: FoodDensitySource,
  basis: Basis,
  nutrientKey: keyof NutritionFactBase<number>
): number | undefined => {
  const value = food.nutritionFacts[nutrientKey];
  switch (basis) {
    case 'per100g':
      return value;
    case 'perYen':
      return food.cost > 0 ? value / food.cost : undefined;
    case 'perKcal': {
      const { calories } = food.nutritionFacts;
      return calories > PER_KCAL_MIN_CALORIES ? value / calories : undefined;
    }
  }
};

/**
 * INQ（Index of Nutritional Quality）＝ 栄養素の充足率 ÷ エネルギーの充足率。
 * 「この食材だけで1日のエネルギー dailyEnergyKcal を摂ったとき、その栄養素は
 * 1日量 dailyAmount の何倍になるか」。1 = カロリーに見合った量。
 * 比の比なので、体格・活動量の個人差は %DRI 表示よりも相殺される。
 *
 * dailyAmount に下限（min）を渡せば「充足倍率」、上限（食塩の目標量上限など）を
 * 渡せば 1 超過が「この食材だけでは上限を超える」という警告の意味になる。
 *
 * エネルギー源にならない食材（calories ≤ PER_KCAL_MIN_CALORIES）では
 * 仮定自体が成立しないため undefined。
 */
export const inq = (
  nutritionFacts: NutritionFactBase<number>,
  nutrientKey: keyof NutritionFactBase<number>,
  dailyAmount: number,
  dailyEnergyKcal: number
): number | undefined => {
  const { calories } = nutritionFacts;
  if (calories <= PER_KCAL_MIN_CALORIES) return undefined;
  if (dailyAmount <= 0 || dailyEnergyKcal <= 0) return undefined;
  return nutritionFacts[nutrientKey] / dailyAmount / (calories / dailyEnergyKcal);
};
