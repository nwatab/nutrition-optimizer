/**
 * 100gあたりの栄養価
 */
export type NutritionTarget = NutritionFactBase<
  EqualConstraint,
  MinConstraint,
  MaxConstraint,
  MinMaxConstraint
>;
export type NutritionFactBase<E, Min = E, Max = E, MinMax = E> = {
  calories: E;
  protein: MinMax;
  fat: MinMax;
  saturatedFattyAcids: Max;
  n6PolyunsaturatedFattyAcids: Min;
  n3PolyunsaturatedFattyAcids: Min;
  /**
   * 利用可能炭水化物（質量計）
   */
  carbohydrates: MinMax;
  fiber: Min;
  /**
   * レチノール活性当量
   */
  vitaminA: MinMax;
  vitaminD: MinMax;
  /**
   * α-トコフェロール
   */
  vitaminE: MinMax;
  vitaminK: Min;
  vitaminB1: Min;
  vitaminB2: Min;
  vitaminB6: Min;
  vitaminB12: Min;
  niacin: Min;
  folate: MinMax;
  pantothenicAcid: Min;
  biotin: Min;
  vitaminC: Min;
  nacl: MinMax;
  potassium: MinMax;
  calcium: MinMax;
  magnesium: Min;
  phosphorus: MinMax;
  iron: Min;
  zinc: MinMax;
  copper: MinMax;
  /**
   * マンガン
   */
  manganese: MinMax;
  iodine: MinMax;
  selenium: MinMax;
  chromium: MinMax;
  molybdenum: MinMax;
};

type EqualConstraint = { equal: number };
type MinConstraint = { min: number };
type MaxConstraint = { max: number };
type MinMaxConstraint = { min: number; max: number };
export type ConstraintRange =
  | EqualConstraint
  | MinConstraint
  | MaxConstraint
  | MinMaxConstraint;

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
   * 可食部100gあたりの金額 [円]（廃棄率補正済み）
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
   * 可食部100gあたりの金額 [円]（廃棄率補正済み）
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
   * 可食部100gあたりの金額 [円]（廃棄率補正済み）
   */
  cost: number;
  /**
   * 商品のURL
   */
  url: string;
};

/**
 * 食材 1kg あたりの環境負荷。
 * 出典は Poore & Nemecek (2018) の世界平均値（食材カテゴリで対応付け）。
 * 原産地による差は未補正。詳細は data/environmental-impact-reference.ts を参照。
 */
export type EnvironmentalImpact = {
  co2eKgPerKg: number;
  landM2PerKg: number;
  waterLPerKg: number;
};

export type ProductionMethod = 'conventional' | 'organic';

/**
 * 比較ノードの属性。有機/慣行は別ノードとして扱う。
 * 残留農薬は boolean 属性のみで、健康コストは数値化しない（意図的な設計判断）。
 */
export type EnvAttributes = {
  env: EnvironmentalImpact;
  productionMethod: ProductionMethod;
  pesticideResidue?: boolean;
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
