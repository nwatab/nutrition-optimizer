import { describe, it, expect } from 'vitest';
import {
  buildTarget,
  estimateEnergyRequirement,
  proteinRdaGrams,
} from './targetAmount';

describe('buildTarget (食事摂取基準 2025 パラメトリック化)', () => {
  it('30代男性・体重70kg・ふつうで現行の基準値と一致（2025改定分を除く）', () => {
    const target = buildTarget({
      ageBand: '30-49',
      sex: 'male',
      weightKg: 70,
      pal: 'normal',
    });

    // EER = 22.5 × 70 × 1.75 = 2756.25（現行の固定値 2750 とほぼ一致）
    expect(target.calories.equal).toBeCloseTo(2756.25, 2);

    // 表引きの微量栄養素は現行の 30代男性の値と一致する
    expect(target.vitaminA).toEqual({ min: 900, max: 2700 });
    expect(target.vitaminD).toEqual({ min: 9, max: 100 });
    expect(target.calcium).toEqual({ min: 750, max: 2500 });
    expect(target.iron).toEqual({ min: 7.5 });
    expect(target.zinc).toEqual({ min: 9.5, max: 45 });
    expect(target.folate).toEqual({ min: 240, max: 1000 });

    // 式ベースのビタミンは連続計算のため、報告書の丸め値（B1=1.2 等）の1段以内に収まる
    expect(target.vitaminB1.min).toBeCloseTo(1.16, 1);
    expect(target.vitaminB2.min).toBeCloseTo(1.65, 1);
    expect(target.niacin.min).toBeCloseTo(15.9, 0);
    expect(target.vitaminB6.min).toBeCloseTo(1.46, 1);
  });

  it('体重を2倍にすると EER と protein_RDA が比例して増える', () => {
    const single = buildTarget({
      ageBand: '30-49',
      sex: 'male',
      weightKg: 70,
      pal: 'normal',
    });
    const doubled = buildTarget({
      ageBand: '30-49',
      sex: 'male',
      weightKg: 140,
      pal: 'normal',
    });

    expect(doubled.calories.equal).toBeCloseTo(single.calories.equal * 2, 5);
    expect(proteinRdaGrams(140)).toBeCloseTo(proteinRdaGrams(70) * 2, 5);
    expect(estimateEnergyRequirement('30-49', 'male', 140, 'normal')).toBeCloseTo(
      estimateEnergyRequirement('30-49', 'male', 70, 'normal') * 2,
      5
    );
  });

  it('女性・月経ありは鉄の下限が月経なしより高い', () => {
    const withoutMenstruation = buildTarget({
      ageBand: '30-49',
      sex: 'female',
      weightKg: 55,
      pal: 'normal',
      menstruation: false,
    });
    const withMenstruation = buildTarget({
      ageBand: '30-49',
      sex: 'female',
      weightKg: 55,
      pal: 'normal',
      menstruation: true,
    });

    expect(withMenstruation.iron.min).toBeGreaterThan(
      withoutMenstruation.iron.min
    );
    expect(withoutMenstruation.iron.min).toBe(6.0);
    expect(withMenstruation.iron.min).toBe(10.5);
  });

  it('鉄は 2025年版で UL 撤廃のため max を持たない', () => {
    const target = buildTarget({
      ageBand: '30-49',
      sex: 'male',
      weightKg: 70,
      pal: 'normal',
    });
    expect('max' in target.iron).toBe(false);
  });

  it('月経ありでも 65歳以上は区分がないため月経なしの値を用いる', () => {
    const elderly = buildTarget({
      ageBand: '65-74',
      sex: 'female',
      weightKg: 50,
      pal: 'normal',
      menstruation: true,
    });
    expect(elderly.iron.min).toBe(6.0);
  });
});
