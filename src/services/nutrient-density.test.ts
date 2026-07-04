import { describe, expect, it } from 'vitest';
import type { NutritionFactBase } from '@/types/nutrition';
import {
  density,
  inq,
  PER_KCAL_MIN_CALORIES,
  type Basis,
  type FoodDensitySource,
} from './nutrient-density';

const makeNutritionFacts = (
  overrides: Partial<NutritionFactBase<number>>
): NutritionFactBase<number> => ({
  calories: 0,
  protein: 0,
  fat: 0,
  saturatedFattyAcids: 0,
  n6PolyunsaturatedFattyAcids: 0,
  n3PolyunsaturatedFattyAcids: 0,
  carbohydrates: 0,
  fiber: 0,
  vitaminA: 0,
  vitaminD: 0,
  vitaminE: 0,
  vitaminK: 0,
  vitaminB1: 0,
  vitaminB2: 0,
  vitaminB6: 0,
  vitaminB12: 0,
  niacin: 0,
  folate: 0,
  pantothenicAcid: 0,
  biotin: 0,
  vitaminC: 0,
  nacl: 0,
  potassium: 0,
  calcium: 0,
  magnesium: 0,
  phosphorus: 0,
  iron: 0,
  zinc: 0,
  copper: 0,
  manganese: 0,
  iodine: 0,
  selenium: 0,
  chromium: 0,
  molybdenum: 0,
  ...overrides,
});

type NamedFood = FoodDensitySource & { name: string };

// 実データに近い可食部100gあたりの値
const oil: NamedFood = {
  name: 'oil',
  cost: 40,
  nutritionFacts: makeNutritionFacts({ calories: 887, fat: 100 }),
};
const soybean: NamedFood = {
  name: 'soybean',
  cost: 60,
  nutritionFacts: makeNutritionFacts({
    calories: 354,
    protein: 33,
    vitaminC: 2,
    iron: 6.8,
  }),
};
const broccoli: NamedFood = {
  name: 'broccoli',
  cost: 90,
  nutritionFacts: makeNutritionFacts({
    calories: 37,
    protein: 5.4,
    vitaminC: 140,
    iron: 1.3,
  }),
};
const konnyaku: NamedFood = {
  name: 'konnyaku',
  cost: 30,
  nutritionFacts: makeNutritionFacts({ calories: 5, fiber: 2.2 }),
};

const foods = [oil, soybean, broccoli, konnyaku];

const rankBy = (
  targetFoods: NamedFood[],
  basis: Basis,
  key: keyof NutritionFactBase<number>
): string[] =>
  targetFoods
    .map((food) => ({ name: food.name, value: density(food, basis, key) }))
    .filter(
      (entry): entry is { name: string; value: number } =>
        entry.value !== undefined
    )
    .toSorted((a, b) => b.value - a.value)
    .map((entry) => entry.name);

describe('density', () => {
  it('per100g は栄養成分の値そのまま（現行の表示と同じ）', () => {
    expect(density(broccoli, 'per100g', 'vitaminC')).toBe(140);
    expect(density(oil, 'per100g', 'calories')).toBe(887);
  });

  it('perYen は1円あたりの値', () => {
    expect(density(oil, 'perYen', 'calories')).toBeCloseTo(887 / 40);
    expect(density(broccoli, 'perYen', 'vitaminC')).toBeCloseTo(140 / 90);
  });

  it('perKcal は1kcalあたりの値', () => {
    expect(density(broccoli, 'perKcal', 'vitaminC')).toBeCloseTo(140 / 37);
    expect(density(soybean, 'perKcal', 'protein')).toBeCloseTo(33 / 354);
  });

  it('calories≈0（こんにゃく等）は perKcal を undefined として比較から除外できる', () => {
    expect(density(konnyaku, 'perKcal', 'fiber')).toBeUndefined();
    // しきい値ちょうどは除外、わずかに超えれば計算する
    const atThreshold: FoodDensitySource = {
      cost: 10,
      nutritionFacts: makeNutritionFacts({
        calories: PER_KCAL_MIN_CALORIES,
        fiber: 1,
      }),
    };
    const aboveThreshold: FoodDensitySource = {
      cost: 10,
      nutritionFacts: makeNutritionFacts({
        calories: PER_KCAL_MIN_CALORIES + 0.1,
        fiber: 1,
      }),
    };
    expect(density(atThreshold, 'perKcal', 'fiber')).toBeUndefined();
    expect(density(aboveThreshold, 'perKcal', 'fiber')).toBeDefined();
    // per100g / perYen では除外されない
    expect(density(konnyaku, 'per100g', 'fiber')).toBe(2.2);
    expect(density(konnyaku, 'perYen', 'fiber')).toBeCloseTo(2.2 / 30);
  });

  it('cost が 0 以下なら perYen は undefined', () => {
    const freeFood: FoodDensitySource = {
      cost: 0,
      nutritionFacts: makeNutritionFacts({ calories: 100 }),
    };
    expect(density(freeFood, 'perYen', 'calories')).toBeUndefined();
  });

  it('同一食材集合のランキングが basis ごとに入れ替わる', () => {
    // 油は perYen（カロリー単価）で最上位
    expect(rankBy(foods, 'perYen', 'calories')).toEqual([
      'oil',
      'soybean',
      'broccoli',
      'konnyaku',
    ]);
    // perKcal では微量栄養素（ビタミンC・鉄）で油は最下位、
    // per100g で上位だった大豆よりブロッコリーが上に来る。
    // こんにゃくは calories≈0 のためランキング自体から除外される。
    expect(rankBy(foods, 'perKcal', 'vitaminC')).toEqual([
      'broccoli',
      'soybean',
      'oil',
    ]);
    expect(rankBy(foods, 'perKcal', 'iron')).toEqual([
      'broccoli',
      'soybean',
      'oil',
    ]);
    // per100g では鉄は大豆が上位（perKcal と順位が入れ替わる）
    expect(rankBy(foods, 'per100g', 'iron')).toEqual([
      'soybean',
      'broccoli',
      'oil',
      'konnyaku',
    ]);
  });
});

describe('inq', () => {
  // 30〜49歳男性・60kg・ふつう相当の丸め値
  const dailyEnergy = 2400;

  it('充足率の比: (栄養素/1日量) ÷ (カロリー/1日エネルギー)', () => {
    // ブロッコリー: カロリー充足率 37/2400、ビタミンC 充足率 140/100
    expect(inq(broccoli.nutritionFacts, 'vitaminC', 100, dailyEnergy)).toBeCloseTo(
      140 / 100 / (37 / 2400)
    );
  });

  it('1 = カロリーに見合った量（比例配分で過不足なし）', () => {
    // エネルギー比率と栄養素比率が同じ食材は INQ = 1
    const balanced = makeNutritionFacts({ calories: 240, protein: 6.5 });
    expect(inq(balanced, 'protein', 65, dailyEnergy)).toBeCloseTo(1);
  });

  it('高カロリー低栄養（油）は 1 未満、低カロリー高栄養（ブロッコリー）は 1 超', () => {
    expect(inq(oil.nutritionFacts, 'protein', 65, dailyEnergy)).toBe(0);
    expect(
      inq(broccoli.nutritionFacts, 'protein', 65, dailyEnergy)!
    ).toBeGreaterThan(1);
    expect(
      inq(soybean.nutritionFacts, 'vitaminC', 100, dailyEnergy)!
    ).toBeLessThan(1);
  });

  it('エネルギー源にならない食材（こんにゃく等）は undefined', () => {
    expect(inq(konnyaku.nutritionFacts, 'fiber', 21, dailyEnergy)).toBeUndefined();
  });

  it('1日量やエネルギーが 0 以下なら undefined', () => {
    expect(inq(broccoli.nutritionFacts, 'vitaminC', 0, dailyEnergy)).toBeUndefined();
    expect(inq(broccoli.nutritionFacts, 'vitaminC', 100, 0)).toBeUndefined();
  });
});
