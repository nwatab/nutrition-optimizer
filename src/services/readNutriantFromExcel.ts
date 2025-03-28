import { NutritionFacts } from '@/types';
import * as xlsx from 'xlsx';

const excelColumnToIndex = (column: string): number => {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return index - 1; // 0-based index にするため -1
};

export const readExcelWorkbook = (buffer: Buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  return workbook;
};

export const getNutriantsFromExcelWorkbook =
  (nutriantWorkbook: xlsx.WorkBook, fatWorkbook: xlsx.WorkBook) =>
  (productNumber: string): NutritionFacts & { name: string } => {
    const excelMapping: Record<
      keyof (NutritionFacts & { name: string }),
      string
    > = {
      name: 'D',

      calories: 'G',
      protein: 'J',
      fat: 'M',
      fiber: 'S',
      vitaminB12: 'BC',
      vitaminC: 'BG',
      saturatedFattyAcids: 'I',
      n6PolyunsaturatedFattyAcids: 'M',
      n3PolyunsaturatedFattyAcids: 'L',
      carbohydrates: 'P',
      vitaminA: 'AQ',
      vitaminD: 'AR',
      vitaminE: 'AS',
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
      manganese: 'AF',
      iodine: 'AH',
      selenium: 'AI',
      chromium: 'AJ',
      molybdenum: 'AK',
    };

    const sheets = {
      fatty: [
        'saturatedFattyAcids',
        'n6PolyunsaturatedFattyAcids',
        'n3PolyunsaturatedFattyAcids',
      ],
    };

    const result: Partial<NutritionFacts & { name: string }> = {};

    (
      Object.keys(excelMapping) as Array<
        keyof (NutritionFacts & { name: string })
      >
    ).forEach((nutrient) => {
      const isInFattySheet = sheets.fatty.includes(nutrient);
      const sheet = isInFattySheet
        ? fatWorkbook.Sheets['表全体']
        : nutriantWorkbook.Sheets['表全体'];

      if (!sheet) {
        throw new Error("指定されたテーブル '表全体' が見つかりません。");
      }

      const jsonData = xlsx.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
      }) as string[][];

      const row = jsonData.find((row) => row[1] === productNumber);
      if (!row) {
        throw new Error(
          `指定された商品番号が見つかりません。: ${productNumber}`
        );
      }

      const columnIndex = excelColumnToIndex(excelMapping[nutrient]);
      if (row.length <= columnIndex) {
        throw new Error('指定された列が見つかりません。');
      }
      if (nutrient === 'name') {
        result.name = row[columnIndex];
        return;
      }

      // ToDo: 本関数はエクセルファイルを読み出しのみの責務として、返り値は、表データそのままの値とする。
      // 以下の行に書かれtた、後処理のparseは別の箇所に切り出す。
      const value = parseNutrientValue(row[columnIndex]);
      if (value === null) {
        console.warn(
          `食品番号 ${productNumber} の ${nutrient} の値が null です。`
        );
        result[nutrient] = 0;
        return;
      }
      result[nutrient] = value;
    });
    return result as NutritionFacts & { name: string };
  };

/**
 * 文字列1つを number | null に変換する関数。依存性の注入についてはあとで検討
 *
 */
// describe('parseNutrientValue', () => {
//   it('should handle numeric values', () => {
//     expect(parseNutrientValue('1.5')).toBe(1.5);
//   });

//   it('should handle "Tr" as 0', () => {
//     expect(parseNutrientValue('Tr')).toBe(0);
//     expect(parseNutrientValue('(Tr)')).toBe(0);
//   });

//   it('should handle "-" as null', () => {
//     expect(parseNutrientValue('-')).toBeNull();
//   });
// });
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

  // 数値化に失敗した場合はエラー
  if (isNaN(value)) {
    throw new Error(`数値化に失敗しました。: ${str}`);
  }

  return value;
}
