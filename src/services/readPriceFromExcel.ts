import * as xlsx from 'xlsx';

export const readDataFromExcelBuffer = (buffer: Buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0]; // Assuming first sheet
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: '',
  });
  return data;
};

export const trimData = (table: (string | number)[][]) => {
  return table
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) =>
      row.slice(
        // 最初に全て0でないカラムのindexを取得。見つからなければ全カラム数を返す
        table[0].findIndex(
          (_, colIndex) => !table.every((row) => row[colIndex] === '')
        ) === -1
          ? row.length
          : table[0].findIndex(
              (_, colIndex) => !table.every((row) => row[colIndex] === 0)
            )
      )
    );
};

// itemCodeに関する情報を取り出す関数と、その出力結果から価格を抽出する関数を分けた方が良い
export const makeReadPriceFromExcelData =
  (data: (string | number)[][]) =>
  (
    itemCode: number
  ): {
    prices: { monthCode: string; season: string; price: number }[];
    name: string;
    estatMassGram: number | null;
  } | null => {
    // Locate item codes (Row 10, index 9)
    const ITEM_CODE_ROW = 7;
    const ITEM_NAME_ROW = 8;
    const ESTAT_MASS_GRAM_ROW = 9;
    const itemCodes = data[ITEM_CODE_ROW];

    const columnIndex = itemCodes.findIndex((code) => code === itemCode);
    if (columnIndex === -1) {
      return null;
    }
    const itemName = data[ITEM_NAME_ROW][columnIndex] as string;
    type EstatMassGramRaw = '(100g)' | '(1kg)' | '(1袋･5kg)' | '(1袋･300g)';

    const estatMassGram =
      { '(100g)': 100, '(1kg)': 1000, '(1袋･5kg)': 5000, '(1袋･300g)': 300 }[
        data[ESTAT_MASS_GRAM_ROW][columnIndex] as EstatMassGramRaw | string
      ] ?? null; // default to null if not found.
    const recentPrices = data
      .map(
        (row) =>
          ({
            monthCode: row[1],
            season: row[4],
            price: row[columnIndex],
          }) as {
            monthCode: string;
            season: string;
            price: number;
          }
      )
      .filter(
        (data) => data.monthCode.length > 0 && typeof data.price === 'number'
      );
    return { name: itemName, estatMassGram, prices: recentPrices };
  };
