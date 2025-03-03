import * as fs from 'fs';
import * as xlsx from 'xlsx';

export const readPriceFromExcel = (filepath1: string, filepath2: string) => {
  const [sheet1, sheet2] = [
    fs.readFileSync(filepath1),
    fs.readFileSync(filepath2),
  ].map((buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Assuming first sheet
    return workbook.Sheets[sheetName];
  });
  const [data1, data2] = [sheet1, sheet2].map((sheet) =>
    xlsx.utils.sheet_to_json<string[]>(sheet, { header: 1 })
  );
  return [data1, data2];
};

export const getPriceAndUnitFromExcelData =
  (data: string[][]) =>
  (itemCode: string): { price: number; unit: string } | null => {
    // Locate item codes (Row 10, index 9)
    const itemCodes = data[9];
    const columnIndex = itemCodes.findIndex((code) => code === itemCode);
    if (columnIndex === -1) {
      console.error('Item code not found');
      return null;
    }

    // Retrieve unit (Row 12, index 11)
    const unit = data[11][columnIndex] ?? '';

    // Retrieve price (Row 27, index 26)
    const price = parseFloat(data[26][columnIndex]);
    if (isNaN(price)) {
      console.error('Invalid price value');
      return null;
    }

    return { price, unit };
  };
