import { describe, expect, it } from 'vitest';
import type {
  FoodToOptimize,
  NutritionFactBase,
  NutritionTarget,
} from '@/types/nutrition';
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
  productNameEn: 'rice-like',
  url: '',
  cost: 50, // 円/可食部100g
  nutritionFacts: makeNutritionFacts({ calories: 350, protein: 7 }),
};
const soyLike: FoodToOptimize = {
  id: 'soy',
  type: 'manual',
  productName: 'soy-like',
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
  });
});
