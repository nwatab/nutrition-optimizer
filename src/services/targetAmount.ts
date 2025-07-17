import { NutritionTarget } from '@/types/nutrition';

const ENERGY_PER_KG_BY_AGE_AND_PAL = {
  male: {
    low: [null, null, 59.8, 57.1, 54.2, 46.5, 41.9, 35.6, 33.8, 32.7, 32.4, 30.1],
    normal: [82.4, 79.5, 68.7, 65.3, 61.7, 52.7, 47.3, 41.5, 39.4, 38.2, 36.7, 36.6],
    high: [null, null, 77.5, 73.4, 69.2, 58.9, 52.7, 47.4, 45.0, 43.6, 41.0, null]
  },
  female: {
    low: [null, null, 56.6, 53.6, 50.5, 44.4, 39.2, 33.2, 32.9, 31.1, 31.1, 29.0],
    normal: [80.6, 75.7, 64.9, 61.3, 57.4, 50.3, 44.3, 38.7, 38.3, 36.2, 35.2, 35.2],
    high: [null, null, 73.3, 68.9, 64.4, 56.2, 49.3, 44.2, 43.8, 41.4, 39.3, null]
  }
};

const getAgeGroupIndex = (age: number): number => {
  if (age >= 1 && age <= 2) return 0;
  if (age >= 3 && age <= 5) return 1;
  if (age >= 6 && age <= 7) return 2;
  if (age >= 8 && age <= 9) return 3;
  if (age >= 10 && age <= 11) return 4;
  if (age >= 12 && age <= 14) return 5;
  if (age >= 15 && age <= 17) return 6;
  if (age >= 18 && age <= 29) return 7;
  if (age >= 30 && age <= 49) return 8;
  if (age >= 50 && age <= 64) return 9;
  if (age >= 65 && age <= 74) return 10;
  if (age >= 75) return 11;
  return 7; // Default to 18-29 age group
};

export const getDailyCaloryGoal = (
  sex: 'male' | 'female',
  age: number,
  weight: number,
  palCategory: 'low' | 'normal' | 'high'
): number => {
  const ageGroupIndex = getAgeGroupIndex(age);
  const energyPerKg = ENERGY_PER_KG_BY_AGE_AND_PAL[sex][palCategory][ageGroupIndex];
  
  if (energyPerKg === null) {
    const fallbackEnergyPerKg = ENERGY_PER_KG_BY_AGE_AND_PAL[sex]['normal'][ageGroupIndex];
    return Math.round(weight * (fallbackEnergyPerKg || 35)); // Default fallback
  }
  
  return Math.round(weight * energyPerKg);
};
/**
 * 日本人の食事摂取基準。単位はいずれも /日 がつく。
 * [「日本人の食事摂取基準（2025年版）」策定検討会報告書](https://www.mhlw.go.jp/stf/newpage_44138.html)
 * [日本人の食事摂取基準（2025年版）の策定ポイント](https://www.mhlw.go.jp/content/12400000/000706_00000.pdf)
 */
export const getReferenceDailyIntakes = (
  sex: 'male' | 'female',
  age: number,
  weight: number,
  dailyCalory: number = 2750
): NutritionTarget => ({
  calories: { equal: dailyCalory }, // kcal
  protein: { min: (dailyCalory * 0.13) / 4, max: (dailyCalory * 0.2) / 4 }, // g 13-20%エネルギー 目標。耐容上の指定なし。
  fat: { min: (dailyCalory * 0.2) / 9, max: (dailyCalory * 0.3) / 9 }, // g. 脂質単位gあたりのエネルギー = 9kcal/g.
  saturatedFattyAcids: { max: (2700 * 0.07) / 9 }, // 9kcal/g
  n6PolyunsaturatedFattyAcids: { min: 11 }, // g
  n3PolyunsaturatedFattyAcids: { min: 2.2 }, // g
  carbohydrates: { min: (2700 * 0.5) / 4, max: (2700 * 0.65) / 4 }, // 4kcal/g
  fiber: { min: 29 }, // g • 少なくとも1日当たり25～29gの食物繊維の摂取が、様々な生活習慣病のリスク低下に寄与すると報告されているが、食物繊維摂取量と生活習慣病リスクとの間に明らかな閾値は存在しない。WHOのガイドラインなどを踏まえて、少なくとも1日当たり25gの食物繊維を摂取した方が良いと
  vitaminA: { min: 900, max: 2700 }, // μg
  vitaminD: { min: 9, max: 100 }, // μg
  vitaminE: { min: 6.5, max: 800 }, // mg
  vitaminK: { min: 150 }, // μg
  vitaminB1: { min: 1.2 }, // mg
  vitaminB2: { min: 1.7 }, // mg
  vitaminB6: { min: 1.5 }, // mg
  vitaminB12: { min: 4 }, // μg
  niacin: { min: 16 }, // mg
  folate: { min: 240, max: 1000 }, // μg 葉酸
  pantothenicAcid: { min: 6 }, // mg
  biotin: { min: 50 }, // μg
  vitaminC: { min: 100 }, // mg
  nacl: { min: 1.5, max: 6.0 }, // g 高血圧及び慢性腎臓病（CKD）の重症化予防のための食塩相当量の量は、男女とも6.0 g/日未満
  potassium: { min: 2500, max: 3000 }, // mg カリウム
  calcium: { min: 750, max: 2500 }, // mg
  magnesium: { min: 380 }, // mg
  phosphorus: { min: 1000, max: 3000 }, // mg リン
  iron: { min: 7.5 }, // mg
  zinc: { min: 9.5, max: 45 }, // mg
  copper: { min: 0.9, max: 7 }, // mg
  manganese: { min: 3.5, max: 11 }, // mg
  iodine: { min: 140, max: 1400 }, // μg
  selenium: { min: 35, max: 450 }, // μg
  chromium: { min: 10, max: 500 }, // μg
  molybdenum: { min: 30, max: 600 }, // μg
});
