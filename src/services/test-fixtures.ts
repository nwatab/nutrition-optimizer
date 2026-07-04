import type { CompareNode, CostVector } from '@/services/environment';
import type {
  FoodToOptimize,
  ManualFoodData,
  NutritionFactBase,
  NutritionTarget,
  WithId,
  WithIngredientType,
} from '@/types/nutrition';

/**
 * テスト専用フィクスチャ。プロダクションコードから import しないこと。
 */

export const makeNutritionFacts = (
  overrides: Partial<NutritionFactBase<number>> = {}
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

/**
 * ほぼ制約のない目標。テストで注目したい制約だけ overrides で締める。
 */
export const makePermissiveTarget = (
  overrides: Partial<NutritionTarget> = {}
): NutritionTarget => ({
  calories: { equal: 2000 },
  protein: { min: 0, max: UNBOUNDED },
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
  ...overrides,
});

export const makeManualFood = ({
  id,
  cost,
  nutritionFacts = {},
}: {
  id: string;
  cost: number;
  nutritionFacts?: Partial<NutritionFactBase<number>>;
}): WithId<WithIngredientType<ManualFoodData, 'manual'>> => ({
  id,
  type: 'manual',
  productName: id,
  productNameEn: id,
  url: `https://example.com/${id}`,
  cost,
  nutritionFacts: makeNutritionFacts(nutritionFacts),
});

export const asFoods = (
  ...foods: WithId<WithIngredientType<ManualFoodData, 'manual'>>[]
): FoodToOptimize[] => foods;

export const makeCompareNode = ({
  id,
  nutrientDensity = {},
  costVector = {},
  productionMethod = 'conventional',
}: {
  id: string;
  nutrientDensity?: Partial<NutritionFactBase<number>>;
  costVector?: Partial<CostVector>;
  productionMethod?: CompareNode['productionMethod'];
}): CompareNode => ({
  id,
  label: id,
  foodId: id,
  intakeForm: 'as is',
  distributionStage: 'retail',
  productionMethod,
  envCategory: 'otherVegetables',
  nutrientDensity: makeNutritionFacts(nutrientDensity),
  costVector: { yen: 0, co2eKg: 0, landM2: 0, waterL: 0, ...costVector },
});
