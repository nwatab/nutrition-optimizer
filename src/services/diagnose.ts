import type {
  ConstraintRange,
  NutritionFactBase,
  NutritionTarget,
} from '@/types/nutrition';

export type NutrientKey = keyof NutritionFactBase<number>;

export type DiagnosisStatus = 'deficient' | 'excess' | 'ok';

export type Diagnosis = {
  key: NutrientKey;
  status: DiagnosisStatus;
  /**
   * 目標からの符号付きの差。
   * - deficient: intake - min（負値）
   * - excess:    intake - max（正値）
   * - ok:        0
   * 単位は各栄養素の単位（g, mg, μg, kcal）に従う。
   */
  gap: number;
};

const boundsOf = (
  constraint: ConstraintRange
): { min: number | null; max: number | null } => {
  if ('equal' in constraint) {
    return { min: constraint.equal, max: constraint.equal };
  }
  return {
    min: 'min' in constraint ? constraint.min : null,
    max: 'max' in constraint ? constraint.max : null,
  };
};

/**
 * 摂取量と目標を突き合わせ、不足/過剰を栄養素ごとに診断する。
 * min を下回れば deficient（gap < 0）、max を超えれば excess（gap > 0）。
 */
export const diagnose = (
  intake: NutritionFactBase<number>,
  target: NutritionTarget
): Diagnosis[] =>
  (Object.keys(target) as NutrientKey[]).map((key) => {
    const { min, max } = boundsOf(target[key]);
    const value = intake[key];

    if (min !== null && value < min) {
      return { key, status: 'deficient', gap: value - min };
    }
    if (max !== null && value > max) {
      return { key, status: 'excess', gap: value - max };
    }
    return { key, status: 'ok', gap: 0 };
  });
