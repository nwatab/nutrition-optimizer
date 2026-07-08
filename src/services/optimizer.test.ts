import { describe, expect, it } from 'vitest';
import type {
  FoodToOptimize,
  NutritionFactBase,
  NutritionTarget,
} from '@/types/nutrition';
import { environmentalImpactOf } from './environment';
import { optimizeDiet } from './optimizer';

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

const UNBOUNDED = 1e9;

// カロリーとタンパク質以外は実質無制約のターゲット
const target: NutritionTarget = {
  calories: { equal: 2000 },
  protein: { min: 50, max: UNBOUNDED },
  fat: { min: 0, max: UNBOUNDED },
  saturatedFattyAcids: { max: UNBOUNDED },
  n6PolyunsaturatedFattyAcids: { min: 0 },
  n3PolyunsaturatedFattyAcids: { min: 0 },
  carbohydrates: { min: 0, max: UNBOUNDED },
  fiber: { min: 0 },
  vitaminA: { min: 0, max: UNBOUNDED },
  vitaminD: { min: 0, max: UNBOUNDED },
  vitaminE: { min: 0, max: UNBOUNDED },
  vitaminK: { min: 0 },
  vitaminB1: { min: 0 },
  vitaminB2: { min: 0 },
  vitaminB6: { min: 0 },
  vitaminB12: { min: 0 },
  niacin: { min: 0 },
  folate: { min: 0, max: UNBOUNDED },
  pantothenicAcid: { min: 0 },
  biotin: { min: 0 },
  vitaminC: { min: 0 },
  nacl: { min: 0, max: UNBOUNDED },
  potassium: { min: 0, max: UNBOUNDED },
  calcium: { min: 0, max: UNBOUNDED },
  magnesium: { min: 0 },
  phosphorus: { min: 0, max: UNBOUNDED },
  iron: { min: 0 },
  zinc: { min: 0, max: UNBOUNDED },
  copper: { min: 0, max: UNBOUNDED },
  manganese: { min: 0, max: UNBOUNDED },
  iodine: { min: 0, max: UNBOUNDED },
  selenium: { min: 0, max: UNBOUNDED },
  chromium: { min: 0, max: UNBOUNDED },
  molybdenum: { min: 0, max: UNBOUNDED },
};

const riceLike: FoodToOptimize = {
  id: 'rice',
  type: 'manual',
  productName: 'rice-like',
  productNameJa: 'rice-like',
  productNameEn: 'rice-like',
  url: '',
  cost: 50, // 円/可食部100g
  nutritionFacts: makeNutritionFacts({ calories: 350, protein: 7 }),
};
const soyLike: FoodToOptimize = {
  id: 'soy',
  type: 'manual',
  productName: 'soy-like',
  productNameJa: 'soy-like',
  productNameEn: 'soy-like',
  url: '',
  cost: 80,
  nutritionFacts: makeNutritionFacts({ calories: 400, protein: 33 }),
};

describe('optimizeDiet', () => {
  it('目的関数は円のままで、固定入力に対する解は PR-B 前後で不変（回帰）', () => {
    const result = optimizeDiet([riceLike, soyLike], target);

    // 手計算による厳密解:
    //   350x + 400y = 2000, 7x + 33y = 50
    //   → y = 0.4, x = 1840/350, 総コスト = 50x + 80y
    const expectedSoy = 0.4;
    const expectedRice = 1840 / 350;
    const expectedCost = 50 * expectedRice + 80 * expectedSoy;

    // yalps の数値許容誤差（~1e-6）に合わせて精度は4桁で比較する
    expect(result.status).toBe('optimal');
    expect(result.totalCost).toBeCloseTo(expectedCost, 4);

    const rice = result.breakdown.find((food) => food.id === 'rice');
    const soy = result.breakdown.find((food) => food.id === 'soy');
    expect(rice?.hectoGrams).toBeCloseTo(expectedRice, 4);
    expect(soy?.hectoGrams).toBeCloseTo(expectedSoy, 4);
    expect(result.totalNutritionFacts.calories).toBeCloseTo(2000, 4);
    expect(result.totalNutritionFacts.protein).toBeCloseTo(50, 4);
    // 価格 0 のとき目的関数値は円の支出そのもの
    expect(result.totalYen).toBeCloseTo(result.totalCost, 4);
  });

  it('CO2e に価格を付けると、環境負荷の低い食材へ解が切り替わる', () => {
    // 栄養は同一、安い方が高CO2e（ライス→rice区分、トマト→tomatoes区分）
    const nutritionFacts = makeNutritionFacts({ calories: 400, protein: 10 });
    const cheapHighCo2: FoodToOptimize = {
      id: 'cheap-rice',
      type: 'manual',
      productName: 'ライス',
      productNameJa: 'ライス',
      productNameEn: 'rice',
      url: '',
      cost: 50,
      nutritionFacts,
    };
    const priceyLowCo2: FoodToOptimize = {
      id: 'pricey-tomato',
      type: 'manual',
      productName: 'トマト',
      productNameJa: 'トマト',
      productNameEn: 'tomato',
      url: '',
      cost: 60,
      nutritionFacts,
    };
    const co2PerHectogram = (food: FoodToOptimize) =>
      environmentalImpactOf(food).co2eKgPerKg / 10;
    // フィクスチャの前提（安い方が高CO2e）が崩れていないことの防波堤
    expect(co2PerHectogram(cheapHighCo2)).toBeGreaterThan(
      co2PerHectogram(priceyLowCo2)
    );

    const foods = [cheapHighCo2, priceyLowCo2];
    const cheapest = optimizeDiet(foods, target);
    expect(cheapest.breakdown.map((food) => food.id)).toEqual(['cheap-rice']);

    // 損益分岐の2倍の炭素価格なら、総コスト最小はトマト側に反転する
    const breakEven =
      (priceyLowCo2.cost - cheapHighCo2.cost) /
      (co2PerHectogram(cheapHighCo2) - co2PerHectogram(priceyLowCo2));
    const weights = {
      yenPerKgCo2e: breakEven * 2,
      yenPerM2Land: 0,
      yenPerLWater: 0,
    };
    const greenest = optimizeDiet(foods, target, weights);
    expect(greenest.breakdown.map((food) => food.id)).toEqual([
      'pricey-tomato',
    ]);
    // 目的関数値 = 円の支出 + 価格×環境負荷 の恒等式
    expect(greenest.totalCost).toBeCloseTo(
      greenest.totalYen +
        weights.yenPerKgCo2e * greenest.environmentalTotals.co2eKg,
      4
    );
  });
});
