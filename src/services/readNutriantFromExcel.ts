import { NutritionFacts } from '@/types';
import { promises as fs } from 'fs';
import * as xlsx from 'xlsx';

const excelColumnToIndex = (column: string): number => {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return index - 1; // 0-based index にするため -1
};

export const readExcelWorkbook = async (filepath: string) => {
  const buffer = await fs.readFile(filepath);
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  return workbook;
};

export const getNutriantFromExcelWorkbook =
  (nutriantWorkbook: xlsx.WorkBook, fatWorkbook: xlsx.WorkBook) =>
  (productNumber: string, nutriant: keyof NutritionFacts): string => {
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
      defval: '',
    }) as string[][];

    // 商品番号を検索し、対応する飽和脂肪酸の値を取得
    const row = jsonData.find((row) => row[1] === productNumber);
    if (!row) {
      throw new Error('指定された商品番号が見つかりません。');
    }
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
    if (row.length <= columnIndex) {
      throw new Error('指定された列が見つかりません。');
    }
    return row[columnIndex];
  };

/**
 * 文字列1つを number | null に変換する関数
 */
export function parseNutrientValue(str: string | number): number | null {
  // 前後の空白を除去

  // ハイフン (未測定) は null として扱う
  if (str === '-') {
    return null;
  }
  if (typeof str === 'number') {
    return str;
  }

  // カッコを外す（例: "(1.2)" -> "1.2", "(Tr)" -> "Tr"）
  const withoutParens = str.replace(/[()]/g, '');

  // "Tr" は 0 として扱う（カッコ付きを外した結果でもOK）
  if (withoutParens === 'Tr') {
    return 0;
  }

  // parseFloat で数値化
  const value = parseFloat(withoutParens);

  // 数値化に失敗した場合は null
  if (isNaN(value)) {
    return null;
  }

  return value;
}
