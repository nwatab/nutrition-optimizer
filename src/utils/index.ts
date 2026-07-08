import type { Locale } from '@/config';
import type { Food } from '@/types/nutrition';

/**
 * 食材の表示名。日本語はデータの原文名（e-stat 品目名 / 商品短縮名）、
 * 英語は成分表英語版の食品名（手動データは参照データの英語商品名）。
 * 価格なし食材（mext）は成分表名をそのまま表示名にする。
 */
export function foodDisplayName(food: Food, locale: Locale): string {
  if (locale === 'ja-JP') {
    // estat/mext は成分表・e-stat 名が既に短い。manual 系は原題が長いので短縮名を使う。
    if (food.type === 'estat') return food.nameInEstat;
    if (food.type === 'mext') return food.nameInNutritionFacts;
    return food.productNameJa;
  }
  return food.type === 'estat' || food.type === 'mext'
    ? food.nameEnInNutritionFacts
    : food.productNameEn;
}

/**
 * 表示名を補足する成分表上の食品名。表示名と同一なら undefined。
 */
export function foodNutritionFactsName(
  food: Food,
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
