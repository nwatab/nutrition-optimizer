/**
 * 100gあたりの栄養価
 */

export type NutritionTarget = NutritionBase<Range>;

export type NutritionBase<T> = {
  calories: T;
  protein: T;
  fat: T;
  fiber: T;
  vitaminB12: T;
  vitaminC: T;
  saturatedFattyAcids: T;
  n6PolyunsaturatedFattyAcids: T;
  n3PolyunsaturatedFattyAcids: T;
  carbohydrates: T;
  vitaminA: T;
  vitaminD: T;
  vitaminE: T;
  vitaminK: T;
  vitaminB1: T;
  vitaminB2: T;
  niacin: T;
  folate: T;
  pantothenicAcid: T;
  biotin: T;
  nacl: T;
  potassium: T;
  calcium: T;
  magnesium: T;
  phosphorus: T;
  iron: T;
  zinc: T;
  copper: T;
  manganese: T;
  iodine: T;
  selenium: T;
  chromium: T;
  molybdenum: T;
};

type Range = MinMaxRange;

export type MinMaxRange = {
  min?: number;
  max?: number;
};

export type NutritionFacts = NutritionBase<number>;

export type NutritionFactAndCost = NutritionFacts & {
  cost: number; // 100gあたりの金額
};

/**
 * 食材情報
 */
export type FoodData = NutritionFactAndCost & {
  name: string;
  shokuhinbangou: string;
};
