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

export const checks: AnomalyCheck[] = [
  checkNegativeAmount,
  checkAmountWithSymbol,
  checkFutureDated,
  // More checks here...
];

export function detectAnomalies(rows: ValidatedRow[], context: ImportContext): ImportAnomaly[][] {
  return rows.map((row, i) => 
    checks.map(check => check(row, i, rows, context)).filter(a => a !== null) as ImportAnomaly[]
  );
}
