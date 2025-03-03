import { NutritionFacts } from '@/types';
import * as fs from 'fs';
import * as xlsx from 'xlsx';

const excelColumnToIndex = (column: string): number => {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return index - 1; // 0-based index にするため -1
};

export const getNutriantFromExcel = (
  filepathForNutriants: string,
  filepathForFats: string
) => {
  const nutriandBuffer = fs.readFileSync(filepathForNutriants);
  const nutriantWorkbook = xlsx.read(nutriandBuffer, { type: 'buffer' });
  const fatBuffer = fs.readFileSync(filepathForFats);
  const fatWorkbook = xlsx.read(fatBuffer, { type: 'buffer' });
  return (
    productNumber: string,
    nutriant: keyof NutritionFacts
  ): string | null => {
    // "表全体" という名前のテーブルを取得
    const sheet = [
      'saturatedFattyAcids',
      'n6PolyunsaturatedFattyAcids',
      'n3PolyunsaturatedFattyAcids',
    ].includes(nutriant)
      ? fatWorkbook.Sheets['表全体']
      : nutriantWorkbook.Sheets['表全体'];
    if (!sheet) {
      throw new Error("指定されたテーブル '表全体' が見つかりません。");
    }

    // シートをJSONに変換
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
    }) as string[][];

    // 商品番号を検索し、対応する飽和脂肪酸の値を取得
    const row = jsonData.find((row) => row[1] === productNumber);
    const excelMapping: Record<keyof NutritionFacts, string> = {
      calories: 'G',
      protein: 'J',
      fat: 'M',
      fiber: 'S',
      vitaminB12: 'BC',
      vitaminC: 'BG',
      saturatedFattyAcids: 'I',
      n6PolyunsaturatedFattyAcids: 'M',
      n3PolyunsaturatedFattyAcids: 'L',
      carbohydrates: 'P', //利用可能炭水化物（質量計）
      vitaminA: 'AQ', // レチノール活性当量
      vitaminD: 'AR',
      vitaminE: 'AS', // α-トコフェロール
      vitaminK: 'AW',
      vitaminB1: 'AX',
      vitaminB2: 'AY',
      niacin: 'AZ',
      folate: 'BD',
      pantothenicAcid: 'BE',
      biotin: 'BF',
      nacl: 'BI',
      potassium: 'Y',
      calcium: 'Z',
      magnesium: 'AA',
      phosphorus: 'AB',
      iron: 'AC',
      zinc: 'AD',
      copper: 'AE',
      manganese: 'AF', // マンガン
      iodine: 'AH',
      selenium: 'AI',
      chromium: 'AJ',
      molybdenum: 'AK',
    };
    const columnIndex = excelColumnToIndex(excelMapping[nutriant]);
    return row?.[columnIndex] ?? null;
  };
};
