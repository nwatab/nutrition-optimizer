import * as xlsx from 'xlsx';

/**
 * 英語版の食品名から改行・脚注マーカー（*）・［*Syn. ...］等の注記を除き、
 * 表示用の名称に整形する。
 */
export const cleanEnglishFoodName = (raw: string): string =>
  raw
    .replace(/［[^］]*］/g, '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * 「STANDARD TABLES OF FOOD COMPOSITION IN JAPAN -2015- (Seventh Revised Edition)」
 * 英語版本表（シート 'Table'、B列=食品番号、D列=英語名）から
 * 食品番号 → 英語名 を引く関数を返す。
 * https://www.mext.go.jp/en/policy/science_technology/policy/title01/detail01/sdetail01/sdetail01/1385122.htm
 */
export const getEnglishFoodNamesFromExcelWorkbook = (
  workbook: xlsx.WorkBook
): ((shokuhinbangou: string) => string | undefined) => {
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets['Table'], {
    header: 1,
    defval: '',
  }) as (string | number)[][];
  const names = new Map(
    rows
      .filter(
        (row): row is string[] =>
          typeof row[1] === 'string' && /^\d{5}$/.test(row[1])
      )
      .map((row) => [row[1], cleanEnglishFoodName(String(row[3]))])
  );
  return (shokuhinbangou) => names.get(shokuhinbangou);
};
