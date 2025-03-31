import { NutritionTarget } from '@/types';
/**
 * 1日に必要な栄養素の量
 */
export const referenceDailyIntakes: NutritionTarget = {
  calories: { min: 2700, max: 2700 * 1.2 }, // kcal
  protein: { min: 65 }, // g
  fat: { min: (2700 * 0.2) / 9, max: (2700 * 0.3) / 9 }, // g. 脂質単位gあたりのエネルギー = 9kcal/g. 脂質は全エネルギーの20%と仮定
  saturatedFattyAcids: { max: (2700 * 0.07) / 9 }, // 9kcal/g
  n6PolyunsaturatedFattyAcids: { min: 10 }, // g
  n3PolyunsaturatedFattyAcids: { min: 2 }, // g
  carbohydrates: { min: (2700 * 0.5) / 4, max: (2700 * 0.65) / 4 }, // 4kcal/g
  fiber: { min: 21 }, // g
  vitaminA: { min: 900 }, // μg
  vitaminD: { min: 8.5 }, // μg
  vitaminE: { min: 6 }, // mg
  vitaminK: { min: 150 }, // μg
  vitaminB1: { min: 1.4 }, // mg
  vitaminB2: { min: 1.6 }, // mg
  vitaminB6: { min: 1.4 }, // mg
  vitaminB12: { min: 2.4 }, // μg
  niacin: { min: 15 }, // mg
  folate: { min: 240 }, // μg 葉酸
  pantothenicAcid: { min: 5 }, // mg
  biotin: { min: 50 }, // μg
  vitaminC: { min: 100 }, // mg
  nacl: { max: 7.5 }, // g
  potassium: { min: 2500 }, // mg カリウム
  calcium: { min: 750 }, // mg
  magnesium: { min: 370 }, // mg
  phosphorus: { min: 1000 }, // mg リン
  iron: { min: 7.5 }, // mg
  zinc: { min: 11 }, // mg
  copper: { min: 0.9 }, // mg
  manganese: { min: 4 }, // mg
  iodine: { min: 130 }, // μg
  selenium: { min: 30 }, // μg
  chromium: { min: 10 }, // μg
  molybdenum: { min: 30 }, // μg
};
