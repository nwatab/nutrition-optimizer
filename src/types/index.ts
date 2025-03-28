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
  /**
   * 利用可能炭水化物（質量計）
   */
  carbohydrates: T;
  /**
   * レチノール活性当量
   */
  vitaminA: T;
  vitaminD: T;
  vitaminE: T;
  /**
   * α-トコフェロール
   */
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
  /**
   * マンガン
   */
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

/**
 * NutritionFactsRaw は、89, 6.1, '(0)', '0.30', '2.0', 'Tr', '1.00' などの形式の生データを扱います。
 * 各栄養成分は string または number で表現されます。
 */
export type NutritionFactsRaw = NutritionBase<string | number>;
export type NullableNutritionFacts = NutritionBase<number | null>;

export type NutritionFactAndCost = NutritionFacts & {
  /**
   * 100gあたりの金額
   */
  cost: number;
};

/**
 * 食材情報
 */
export type FoodData = NutritionFactAndCost & {
  name: string;
  shokuhinbangou: string;
};
