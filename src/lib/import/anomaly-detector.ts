import { ValidatedRow } from './validator';

export interface ImportAnomaly {
  anomalyType: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  description: string;
  suggestedFix?: any;
}

export interface ImportContext {
  groupMembers: string[];
  today: string;
}

type AnomalyCheck = (row: ValidatedRow, index: number, allRows: ValidatedRow[], context: ImportContext) => ImportAnomaly | null;

const checkNegativeAmount: AnomalyCheck = (row) => {
  if (parseFloat(row.amount) < 0) {
    return {
      anomalyType: 'NEGATIVE_AMOUNT',
      severity: 'WARNING',
      description: 'Amount is negative. Could be a refund.',
      suggestedFix: { amount: Math.abs(parseFloat(row.amount)).toString() }
    };
  }
  return null;
};

const checkAmountWithSymbol: AnomalyCheck = (row) => {
  if (/[^0-9.-]/.test(row.amount)) {
    return {
      anomalyType: 'AMOUNT_WITH_SYMBOL',
      severity: 'INFO',
      description: 'Amount contained symbols and was stripped.',
    };
  }
  return null;
};

const checkFutureDated: AnomalyCheck = (row, idx, rows, context) => {
  if (row.date > context.today) {
    return {
      anomalyType: 'FUTURE_DATED',
      severity: 'WARNING',
      description: 'Expense date is in the future.',
    };
  }
  return null;
};

const checkDateFormatError: AnomalyCheck = (row) => {
  if (!row.date || !row.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      anomalyType: 'INVALID_DATE_FORMAT',
      severity: 'ERROR',
      description: `Unrecognized date format: ${row.date}`,
    };
  }
  return null;
};

const checkMissingSummaryData: AnomalyCheck = (row) => {
    if (!row.amount || parseFloat(row.amount) === 0 || isNaN(parseFloat(row.amount))) {
         return {
             anomalyType: 'MISSING_AMOUNT',
             severity: 'ERROR',
             description: 'Amount is 0 or missing.'
         };
    }
    if (!row.paid_by || row.paid_by.trim() === '') {
         return {
             anomalyType: 'MISSING_PAYER',
             severity: 'ERROR',
             description: 'Missing payer information.'
         };
    }
    return null;
};

const checkSettlementMisclassification: AnomalyCheck = (row) => {
    const desc = row.description?.toLowerCase() || '';
    if (desc.includes('paid back') || desc.includes('settlement') || desc.includes('deposit')) {
        return {
            anomalyType: 'SETTLEMENT_MISCLASSIFICATION',
            severity: 'WARNING',
            description: 'This looks like a settlement or deposit rather than a shared expense.',
            suggestedFix: { isSettlement: true }
        };
    }
    return null;
};

const checkDuplicates: AnomalyCheck = (row, idx, allRows) => {
    const isDupe = allRows.findIndex((r, i) => 
        i !== idx &&
        r.date === row.date && 
        Math.abs(parseFloat(r.amount) - parseFloat(row.amount)) < 0.01 &&
        r.description.toLowerCase().trim() === row.description.toLowerCase().trim()
    ) !== -1;

    if (isDupe) {
        return {
            anomalyType: 'DUPLICATE_EXPENSE',
            severity: 'WARNING',
            description: 'This expense appears to be a duplicate of another entry.',
            suggestedFix: { action: 'DISCARD' }
        };
    }
    return null;
};

export const checks: AnomalyCheck[] = [
  checkNegativeAmount,
  checkAmountWithSymbol,
  checkFutureDated,
  checkDateFormatError,
  checkMissingSummaryData,
  checkSettlementMisclassification,
  checkDuplicates
];

export function detectAnomalies(rows: ValidatedRow[], context: ImportContext): ImportAnomaly[][] {
  return rows.map((row, i) => 
    checks.map(check => check(row, i, rows, context)).filter(a => a !== null) as ImportAnomaly[]
  );
}
