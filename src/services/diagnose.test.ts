import { describe, expect, it } from 'vitest';

import { diagnose } from '@/services/diagnose';
import {
  makeNutritionFacts,
  makePermissiveTarget,
} from '@/services/test-fixtures';

describe('diagnose', () => {
  it('min/max 両側の gap を符号付きで返す', () => {
    const target = makePermissiveTarget({
      fiber: { min: 29 },
      nacl: { min: 1.5, max: 6.0 },
      protein: { min: 65, max: 100 },
    });
    const intake = makeNutritionFacts({
      calories: 2000, // equal: 2000 → ok
      fiber: 20, // min 29 → 不足
      nacl: 8, // max 6 → 過剰
      protein: 80, // 65..100 内 → ok
    });

    const result = Object.fromEntries(
      diagnose(intake, target).map((d) => [d.key, d])
    );

    expect(result.fiber).toEqual({
      key: 'fiber',
      status: 'deficient',
      gap: -9,
    });
    expect(result.nacl).toEqual({ key: 'nacl', status: 'excess', gap: 2 });
    expect(result.protein).toEqual({ key: 'protein', status: 'ok', gap: 0 });
    expect(result.calories).toEqual({ key: 'calories', status: 'ok', gap: 0 });
  });

  it('equal 制約は min=max として扱う', () => {
    const target = makePermissiveTarget({ calories: { equal: 2000 } });

    const under = diagnose(makeNutritionFacts({ calories: 1800 }), target);
    const over = diagnose(makeNutritionFacts({ calories: 2300 }), target);

    expect(under.find((d) => d.key === 'calories')).toEqual({
      key: 'calories',
      status: 'deficient',
      gap: -200,
    });
    expect(over.find((d) => d.key === 'calories')).toEqual({
      key: 'calories',
      status: 'excess',
      gap: 300,
    });
  });

  it('全栄養素分の診断を返す', () => {
    const target = makePermissiveTarget();
    const diagnoses = diagnose(makeNutritionFacts({ calories: 2000 }), target);
    expect(diagnoses).toHaveLength(Object.keys(target).length);
  });
});
