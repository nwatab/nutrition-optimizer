import { NutritionTarget } from '@/types/nutrition';
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
