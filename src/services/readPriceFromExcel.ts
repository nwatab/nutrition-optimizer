import { promises as fs } from 'fs';
import * as xlsx from 'xlsx';

export const readPriceDataFromExcel = async (filepath: string) => {
  const buffer = await fs.readFile(filepath);
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0]; // Assuming first sheet
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: '',
  });
  return data;
};

export const getPriceFromExcelData =
  (data: (string | number)[][]) =>
  (itemCode: number): number | null => {
    // Locate item codes (Row 10, index 9)
    const ITEM_CODE_ROW = 9;
    const itemCodes = data[ITEM_CODE_ROW];
    const columnIndex = itemCodes.findIndex((code) => code === itemCode);
    if (columnIndex === -1) {
      return null;
    }

    // Retrieve unit (Row 12, index 11)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unit = data[11][columnIndex] ?? '';

    // Retrieve price (Row 27, index 26)
    const price = parseFloat(data[26][columnIndex] as string);
    if (isNaN(price)) {
      console.error('Invalid price value');
      return null;
    }

    return price;
  };
