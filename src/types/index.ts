/**
 * 100gあたりの栄養価
 */
export type NutritionFacts = {
  calories: number;
  protein: number;
  fat: number;
  fiber: number;
  vitaminB12: number;
  vitaminC: number;
};

/**
 * 食材情報
 */
export type Food = NutritionFacts & {
  name: string;
  shokuhinbangou: string;
  cost: number; // 100gあたりの金額
};
