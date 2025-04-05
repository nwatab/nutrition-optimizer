import type { NutritionFactBase } from '@/types/nutrition';
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
  (
    shokuhinbangou: string
  ): {
    name: string;
    shokuhinbangou: string;
    nutritionFacts: NutritionFactBase<string | number | null>;
  } => {
    const excelFoodNameMapping: Record<string, string> = {
      name: 'D',
    };
    const excelNuturitionMapping: Record<
      keyof Omit<
        NutritionFactBase<string | number>,
        | 'name'
        | 'saturatedFattyAcids'
        | 'n6PolyunsaturatedFattyAcids'
        | 'n3PolyunsaturatedFattyAcids'
      >,
      string
    > = {
      calories: 'G',
      protein: 'J',
      fat: 'M',
      fiber: 'S',
      vitaminB12: 'BC',
      vitaminC: 'BG',
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
      vitaminB6: 'BB',
    };
    const excelFattyAcidsMapping: Record<
      | 'saturatedFattyAcids'
      | 'n6PolyunsaturatedFattyAcids'
      | 'n3PolyunsaturatedFattyAcids',
      string
    > = {
      saturatedFattyAcids: 'I',
      n6PolyunsaturatedFattyAcids: 'M',
      n3PolyunsaturatedFattyAcids: 'L',
    };
    const [nutrientJsonData, fattyAcidsJsonData] = [
      nutriantWorkbook.Sheets['表全体'],
      fatWorkbook.Sheets['表全体'],
    ].map(
      (sheet) =>
        xlsx.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
        }) as (string | number)[][]
    );
    const nutritionRow = nutrientJsonData.find(
      (row) => row[1] === shokuhinbangou
    );
    const name = nutritionRow?.[
      excelColumnToIndex(excelFoodNameMapping['name'])
    ] as string | undefined;

    if (!name || !nutritionRow) {
      throw new Error(
        `指定された商品番号が見つかりません。食品番号: ${shokuhinbangou}`
      );
    }

    const nutritionWithoutFattyAcids = (
      Object.entries(excelNuturitionMapping) as Array<
        [
          keyof Omit<
            NutritionFactBase<string | number>,
            | 'name'
            | 'saturatedFattyAcids'
            | 'n6PolyunsaturatedFattyAcids'
            | 'n3PolyunsaturatedFattyAcids'
          >,
          string,
        ]
      >
    ).reduce(
      (acc, [key, value]) => {
        const columnIndex = excelColumnToIndex(value);
        if (nutritionRow.length <= columnIndex) {
          throw new Error(
            `指定された列が見つかりません。食品番号: ${shokuhinbangou}, 列: ${value}`
          );
        }
        acc[key] = nutritionRow[columnIndex];
        return acc;
      },
      {} as Partial<NutritionFactBase<string | number>>
    ) as NutritionFactBase<string | number>;

    const fattyAcidRow = fattyAcidsJsonData.find(
      (row) => row[1] === shokuhinbangou
    );

    const [
      saturatedFattyAcids,
      n6PolyunsaturatedFattyAcids,
      n3PolyunsaturatedFattyAcids,
    ] = (
      [
        'saturatedFattyAcids',
        'n6PolyunsaturatedFattyAcids',
        'n3PolyunsaturatedFattyAcids',
      ] as const
    ).map((fattyAccid) =>
      fattyAcidRow
        ? fattyAcidRow[excelColumnToIndex(excelFattyAcidsMapping[fattyAccid])]
        : null
    );

    return {
      name,
      shokuhinbangou,
      nutritionFacts: {
        ...nutritionWithoutFattyAcids,
        saturatedFattyAcids,
        n6PolyunsaturatedFattyAcids,
        n3PolyunsaturatedFattyAcids,
      },
    };
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
export function parseNutrientRawValue(str: string | number): number | null {
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

export const parseNutritionsRaw = (
  nutriantValues: NutritionFactBase<string | number | null>
): NutritionFactBase<number> => {
  const nutriantValuesWithoutNull = Object.fromEntries(
    Object.entries(nutriantValues).map(([key, value]) => [
      key,
      value === null ? 0 : (parseNutrientRawValue(value) ?? 0), // 未測定値をゼロとする
    ])
  ) as NutritionFactBase<number>;
  return nutriantValuesWithoutNull;
};
