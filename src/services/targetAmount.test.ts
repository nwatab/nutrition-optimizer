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

describe('buildTarget 小児（1〜17歳）', () => {
  it('小児の EER は 基礎代謝基準値 × 体重 × PAL + 組織増加分', () => {
    // 8-9歳男児: 40.8 × 28.0 × 1.60 + 25 = 1852.84
    const target = buildTarget({
      ageBand: '8-9',
      sex: 'male',
      weightKg: 28.0,
      pal: 'normal',
    });
    expect(target.calories.equal).toBeCloseTo(40.8 * 28.0 * 1.6 + 25, 2);
  });

  it('小児のたんぱく質は体重比例式でなく表引きの推奨量', () => {
    // 12-14歳の推奨量は 60 g（体重比例式なら大きく異なる）
    const target = buildTarget({
      ageBand: '12-14',
      sex: 'female',
      weightKg: 47.5,
      pal: 'normal',
    });
    // protein.min = max(表引きRDA 60, 13%エネルギー) 。RDA が下限を決める。
    expect(target.protein.min).toBeGreaterThanOrEqual(60);
  });

  it('小児は上限が未設定の微量栄養素の max を持たない', () => {
    const target = buildTarget({
      ageBand: '3-5',
      sex: 'male',
      weightKg: 16.5,
      pal: 'normal',
    });
    expect(target.calcium.min).toBe(600); // RDA
    expect('max' in target.calcium && target.calcium.max !== undefined).toBe(
      false
    );
    expect(target.vitaminA).toEqual({ min: 500, max: 700 }); // UL は設定あり
  });

  it('1〜5歳は PAL 区分が1つのため低い/高いでも同じ EER', () => {
    const low = buildTarget({
      ageBand: '1-2',
      sex: 'female',
      weightKg: 11,
      pal: 'low',
    });
    const high = buildTarget({
      ageBand: '1-2',
      sex: 'female',
      weightKg: 11,
      pal: 'high',
    });
    expect(low.calories.equal).toBe(high.calories.equal);
  });
});

describe('buildTarget 妊婦・授乳婦の付加量', () => {
  const base = {
    ageBand: '30-49' as const,
    sex: 'female' as const,
    weightKg: 55,
    pal: 'normal' as const,
  };

  it('妊娠後期はエネルギー・たんぱく質・鉄・葉酸が付加量分だけ増える', () => {
    const none = buildTarget({ ...base, maternalStatus: 'none' });
    const late = buildTarget({ ...base, maternalStatus: 'pregnancy-late' });
    expect(late.calories.equal - none.calories.equal).toBeCloseTo(450, 5);
    expect(late.iron.min - none.iron.min).toBeCloseTo(8.5, 5);
    expect(late.folate.min - none.folate.min).toBeCloseTo(240, 5);
    expect(late.vitaminA.min - none.vitaminA.min).toBeCloseTo(80, 5);
  });

  it('妊娠は初期＜中期＜後期でエネルギー付加量が増える', () => {
    const early = buildTarget({ ...base, maternalStatus: 'pregnancy-early' });
    const mid = buildTarget({ ...base, maternalStatus: 'pregnancy-mid' });
    const late = buildTarget({ ...base, maternalStatus: 'pregnancy-late' });
    expect(early.calories.equal).toBeLessThan(mid.calories.equal);
    expect(mid.calories.equal).toBeLessThan(late.calories.equal);
  });

  it('授乳婦は葉酸・亜鉛・エネルギーに付加量が乗る', () => {
    const none = buildTarget({ ...base, maternalStatus: 'none' });
    const lact = buildTarget({ ...base, maternalStatus: 'lactation' });
    expect(lact.calories.equal - none.calories.equal).toBeCloseTo(350, 5);
    expect(lact.folate.min - none.folate.min).toBeCloseTo(100, 5);
    expect(lact.zinc.min - none.zinc.min).toBeCloseTo(3.0, 5);
  });

  it('付加量は女性のみ。男性では maternalStatus を無視する', () => {
    const none = buildTarget({
      ageBand: '30-49',
      sex: 'male',
      weightKg: 70,
      pal: 'normal',
      maternalStatus: 'none',
    });
    const preg = buildTarget({
      ageBand: '30-49',
      sex: 'male',
      weightKg: 70,
      pal: 'normal',
      maternalStatus: 'pregnancy-late',
    });
    expect(preg.calories.equal).toBe(none.calories.equal);
  });
});
