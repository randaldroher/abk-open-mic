export function columnLetter(index: number): string {
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new Error('Invalid spreadsheet column');
  }
  let value = index + 1;
  let result = '';
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + value % 26) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

export function quoteSheetTab(tab: string): string {
  return `'${tab.replaceAll("'", "''")}'`;
}

export function sheetHeaderRange(tab: string, row: number): string {
  if (!Number.isSafeInteger(row) || row < 1) {
    throw new Error('Invalid spreadsheet header row');
  }
  return `${quoteSheetTab(tab)}!${row}:${row}`;
}
