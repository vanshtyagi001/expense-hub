import { parseCsv } from './parser';
import { normalizeRow } from './normalizer';
import { validateRow, ValidatedRow } from './validator';
import { detectAnomalies } from './anomaly-detector';

export async function processCsvUpload(csvContent: string, groupId: string, filename: string, options: { today: string, groupMembers: string[] }) {
  const { rows } = parseCsv(csvContent);
  
  const processedRows: {
    rawRow: any,
    validatedRow?: ValidatedRow,
    errors?: string[],
    anomalies: any[]
  }[] = [];

  const validRowsForAnomalies: ValidatedRow[] = [];
  const indexMap = new Map<number, number>();

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const validation = validateRow(raw);
    
    if (!validation.success) {
      processedRows.push({
        rawRow: raw,
        errors: validation.error.errors.map(e => e.message),
        anomalies: [{ anomalyType: 'MISSING_REQUIRED_FIELD', severity: 'ERROR', description: 'Failed to validate row structure' }]
      });
    } else {
      const normalized = normalizeRow(validation.data);
      validRowsForAnomalies.push(normalized);
      indexMap.set(validRowsForAnomalies.length - 1, i);
      processedRows.push({
        rawRow: raw,
        validatedRow: normalized,
        anomalies: []
      });
    }
  }

  const allAnomalies = detectAnomalies(validRowsForAnomalies, { today: options.today, groupMembers: options.groupMembers });
  
  for (let i = 0; i < validRowsForAnomalies.length; i++) {
    const originalIndex = indexMap.get(i)!;
    processedRows[originalIndex].anomalies.push(...allAnomalies[i]);
  }

  const errorCount = processedRows.filter(r => r.anomalies.some(a => a.severity === 'ERROR')).length;
  
  return {
    processedRows,
    status: errorCount > 0 ? 'REVIEWING' : 'PENDING'
  };
}
