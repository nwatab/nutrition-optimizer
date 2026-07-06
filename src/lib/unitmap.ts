const vitaminUnits = {
  vitaminA: 'μg',
  vitaminD: 'μg',
  vitaminE: 'mg',
  vitaminK: 'μg',
  vitaminB1: 'mg',
  vitaminB2: 'mg',
  vitaminB6: 'mg',
  vitaminB12: 'μg',
  vitaminC: 'mg',
  niacin: 'mg',
  folate: 'μg',
  pantothenicAcid: 'mg',
  biotin: 'μg',
} as const;

const mineralUnits = {
  potassium: 'mg',
  calcium: 'mg',
  magnesium: 'mg',
  phosphorus: 'mg',
  iron: 'mg',
  zinc: 'mg',
  copper: 'mg',
  manganese: 'mg',
  iodine: 'μg',
  selenium: 'μg',
  chromium: 'μg',
  molybdenum: 'μg',
} as const;

const macroUnits = {
  calories: 'kcal',
  protein: 'g',
  fat: 'g',
  carbohydrates: 'g',
  fiber: 'g',
  saturatedFattyAcids: 'g',
  n6PolyunsaturatedFattyAcids: 'g',
  n3PolyunsaturatedFattyAcids: 'g',
  nacl: 'g',
} as const;

export const unitMap = {
  ...vitaminUnits,
  ...mineralUnits,
  ...macroUnits,
} as const;

type UnitMap = typeof unitMap;

export function getNutrientUnit(key: keyof UnitMap): UnitMap[keyof UnitMap] {
  return unitMap[key];
}

/**
 * 栄養素の実量を単位に応じた桁数で整形する。
 * `maximumFractionDigits: 0` 一律だと微量栄養素（B1 の 0.1 mg 等）が
 * 「0 mg」に丸められて誤解を生むため、単位と桁数で有効数字を確保する。
 * - kcal: 0 桁
 * - g: 100 以上 0 桁 / それ未満 1 桁（例 44 g, 9.0 g, 0.3 g）
 * - mg・µg: 100 以上 0 桁 / 10 以上 1 桁 / それ未満 2 桁（例 2,500 mg, 0.10 mg）
 */
export function formatNutrientAmount(
  key: keyof UnitMap,
  value: number,
  locale = 'ja-JP'
): string {
  const unit = unitMap[key];
  const abs = Math.abs(value);
  const digits =
    unit === 'kcal'
      ? 0
      : unit === 'g'
        ? abs >= 100
          ? 0
          : 1
        : abs >= 100
          ? 0
          : abs >= 10
            ? 1
            : 2;
  return value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
