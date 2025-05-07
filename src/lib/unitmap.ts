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
