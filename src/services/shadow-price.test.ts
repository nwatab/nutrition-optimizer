import { describe, expect, it } from 'vitest';

import {
  computeShadowPrices,
  scoreComplements,
} from '@/services/shadow-price';
import { asFoods, makeManualFood, makePermissiveTarget } from '@/services/test-fixtures';

// テスト用の小さな食料経済:
// - rice: カロリー源。fiber を持たない。
// - fiberSupplement: fiber だけを供給する（50g/100g, 100円/100g）。
// - junk: 高価でどの制約にも寄与しない。
// fiber min が唯一の逼迫制約なので、影価格は
// y_fiber = 100円 / 50g = 2 円/g となるはず。
const rice = makeManualFood({
  id: 'rice',
  cost: 50,
  nutritionFacts: { calories: 350, vitaminC: 1 },
});
const fiberSupplement = makeManualFood({
  id: 'fiberSupplement',
  cost: 100,
  nutritionFacts: { fiber: 50 },
});
const junk = makeManualFood({
  id: 'junk',
  cost: 300,
  nutritionFacts: { calories: 1 },
});
const foods = asFoods(rice, fiberSupplement, junk);

const target = makePermissiveTarget({
  calories: { equal: 2000 },
  fiber: { min: 25 },
});

describe('computeShadowPrices', () => {
  it('逼迫した min 制約の影価格を有限差分で復元する', () => {
    const prices = computeShadowPrices(foods, target);

    // fiber を 1g 増やすには fiberSupplement を 1/50 hg = 2円 買い足す
    expect(prices.fiber).toBeCloseTo(2, 3);
    // rice の摂取で十分満たされている vitaminC はスラック → 影価格 0
    expect(prices.vitaminC).toBeCloseTo(0, 6);
  });
});

describe('scoreComplements', () => {
  it('最も不足した栄養素（最大 y_i）を多く含む食材が score 上位に来る', () => {
    const prices = computeShadowPrices(foods, target);
    const maxPriceKey = Object.entries(prices)
      .filter(([, y]) => y !== null)
      .toSorted(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0][0];
    expect(maxPriceKey).toBe('fiber');

    const ranking = scoreComplements(foods, prices, 'perYen');

    expect(ranking[0].food.id).toBe('fiberSupplement');
    // score = y_fiber · 50g / 100円 = 1
    expect(ranking[0].score).toBeCloseTo(1, 3);
    expect(ranking[0].score).toBeGreaterThan(ranking[1].score);
  });

  it('basis で分母を選べる（perKcal ではカロリーの薄い食材の分母が変わる）', () => {
    const prices = computeShadowPrices(foods, target);
    const perYen = scoreComplements(foods, prices, 'perYen');
    const perKcal = scoreComplements(foods, prices, 'perKcal');

    const junkPerYen = perYen.find((s) => s.food.id === 'junk');
    const junkPerKcal = perKcal.find((s) => s.food.id === 'junk');
    // junk は栄養に寄与しないのでどちらの basis でも 0
    expect(junkPerYen?.score).toBe(0);
    expect(junkPerKcal?.score).toBe(0);

    // fiberSupplement は calories 0 のため perKcal では分母 0 → score 0 に落ちる
    const supplementPerKcal = perKcal.find(
      (s) => s.food.id === 'fiberSupplement'
    );
    expect(supplementPerKcal?.score).toBe(0);
  });
});
