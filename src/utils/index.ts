import type { Locale } from '@/config';
import type { FoodToOptimize } from '@/types/nutrition';

/**
 * 食材の表示名。日本語はデータの原文名（e-stat 品目名 / 商品名）、
 * 英語は成分表英語版の食品名（手動データは参照データの英語商品名）。
 */
export function foodDisplayName(food: FoodToOptimize, locale: Locale): string {
  if (locale === 'ja-JP') {
    return food.type === 'estat' ? food.nameInEstat : food.productName;
  }
  return food.type === 'estat'
    ? food.nameEnInNutritionFacts
    : food.productNameEn;
}

/**
 * 表示名を補足する成分表上の食品名。表示名と同一なら undefined。
 */
export function foodNutritionFactsName(
  food: FoodToOptimize,
  locale: Locale
): string | undefined {
  if (food.type === 'manual') return undefined;
  const name =
    locale === 'ja-JP'
      ? food.nameInNutritionFacts
      : food.nameEnInNutritionFacts;
  return name === foodDisplayName(food, locale) ? undefined : name;
}

export function capitalize(str: string): string {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase() // まずすべて小文字に
    .split(/\s+/) // 空白で分割
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
