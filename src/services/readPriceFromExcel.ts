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
  (itemCode: number): number | null => {
    // Locate item codes (Row 10, index 9)
    const ITEM_CODE_ROW = 7;
    const itemCodes = data[ITEM_CODE_ROW];

    const columnIndex = itemCodes.findIndex((code) => code === itemCode);
    if (columnIndex === -1) {
      return null;
    }

    const recentPrices = data
      .map(
        (row) =>
          ({ monthCode: row[1], season: row[4], price: row[columnIndex] }) as {
            monthCode: string;
            season: string;
            price: number;
          }
      )
      .filter(
        (data) => data.monthCode.length > 0 && typeof data.price === 'number'
      )
      .slice(-3);
    const averagePrice =
      recentPrices.reduce((acc, data) => acc + data.price, 0) /
      recentPrices.length;
    return averagePrice;
  };
