import { ValidatedRow } from './validator';
import { parse, isValid, format } from 'date-fns';

export function normalizeDate(dateStr: string): string | null {
  // Try several formats
  const formats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'MMM dd', 'd MMM, yyyy'];
  let parsedDate: Date | null = null;

  for (const f of formats) {
    if (f === 'MMM dd') {
      try {
        const parsed = new Date(dateStr + `, ${new Date().getFullYear()}`);
        if (!isNaN(parsed.getTime())) { parsedDate = parsed; break; }
      } catch (e) {}
    } else {
      const parsed = parse(dateStr, f, new Date());
      if (isValid(parsed)) {
        parsedDate = parsed;
        break;
      }
    }
  }
  
  if (parsedDate) {
    return format(parsedDate, 'yyyy-MM-dd');
  }
  return null;
}

export function cleanupAmount(amountStr: string): string {
  // Strip currency symbols and commas
  return amountStr.replace(/[^0-9.-]/g, '');
}

export function normalizeRow(row: ValidatedRow): ValidatedRow {
  const cleanAmount = cleanupAmount(row.amount);
  const normalizedDate = normalizeDate(row.date) || row.date;

  return {
    ...row,
    amount: cleanAmount,
    date: normalizedDate,
    split_type: row.split_type.toLowerCase() === 'unequal' ? 'exact' : (row.split_type.toLowerCase() === 'share' ? 'shares' : row.split_type as any)
  };
}
