import Papa from 'papaparse';

export interface RawRow {
  date: string;
  description: string;
  amount: string;
  currency: string;
  paid_by: string;
  split_type: string;
  split_with: string;
  split_details: string;
  notes: string;
  [key: string]: any;
}

export function parseCsv(fileContent: string): { rows: RawRow[], rawRows: any[] } {
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase(),
    transform: (val) => val.trim()
  });

  return {
    rows: result.data as RawRow[],
    rawRows: result.data
  };
}
