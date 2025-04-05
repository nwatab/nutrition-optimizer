/**
 * 100gあたりの栄養価
 */

export type NutritionTarget = NutritionFactBase<Range>;

export type NutritionFactBase<T> = {
  calories: T;
  protein: T;
  fat: T;
  fiber: T;
  vitaminB6: T;
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
  /**
   * α-トコフェロール
   */
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

export type MinMaxRange =
  | {
      min: number;
      max: number;
    }
  | {
      min: number;
    }
  | {
      max: number;
    };

/**
 * NutritionFactsRaw は、89, 6.1, '(0)', '0.30', '2.0', 'Tr', '1.00' などの形式の生データを扱います。
 * 各栄養成分は string または number で表現されます。
 */
export type NutritionFactsRaw = NutritionFactBase<string | number>;
export type NullableNutritionFacts = NutritionFactBase<number | null>;

/**
 * 食材情報
 */
export type EstatPriceFoodData = {
  nameInEstat: string;
  nameInNutritionFacts: string;
  shokuhinbangou: string;
  /**
   * 100gあたりの金額
   */
  cost: number;
  /**
   * 可食部100gあたりの栄養成分
   */
  nutritionFacts: NutritionFactBase<number>;
};
export type ManualPriceFoodData = {
  productName: string;
  nameInNutritionFacts: string;
  shokuhinbangou: string;
  /**
   * 100gあたりの金額
   */
  cost: number;
  /**
   * 可食部100gあたりの栄養成分
   */
  nutritionFacts: NutritionFactBase<number>;
  /**
   * 商品のURL
   */
  url: string;
};

export type ManualFoodData = {
  productName: string;
  /**
   * 可食部100gあたりの栄養成分
   */
  nutritionFacts: NutritionFactBase<number>;
  /**
   * 100gあたりの金額
   */
  cost: number;
  /**
   * 商品のURL
   */
  url: string;
};

export type WithId<T> = T & { id: string };
export type WithIngredientType<
  I,
  T extends 'manual' | 'estat' | 'manualPrice' | 'productLink',
> = I & {
  type: T;
};

export type FoodToOptimize =
  | WithId<WithIngredientType<ManualFoodData, 'manual'>>
  | WithId<WithIngredientType<EstatPriceFoodData, 'estat'>>
  | WithId<WithIngredientType<ManualPriceFoodData, 'manualPrice'>>;

export type FoodRequired =
  | (WithId<WithIngredientType<EstatPriceFoodData, 'estat'>> & {
      hectoGrams: number;
    })
  | (WithId<WithIngredientType<ManualPriceFoodData, 'manualPrice'>> & {
      hectoGrams: number;
    })
  | (WithId<WithIngredientType<ManualFoodData, 'manual'>> & {
      hectoGrams: number;
    });
