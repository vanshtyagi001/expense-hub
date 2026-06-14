import { Decimal } from 'decimal.js';

export interface SettlementInstruction {
  fromUserId: string;
  toUserId: string;
  amount: Decimal;
}

// amountInr is the final total in INR
export function calculateEqualSplit(amountInr: Decimal, participantCount: number): Decimal[] {
  if (participantCount === 0) return [];
  const count = new Decimal(participantCount);
  const base = amountInr.div(count).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const totalAllocated = base.times(participantCount);
  const remainder = amountInr.minus(totalAllocated);

  const splits = Array(participantCount).fill(base);
  // Distribute the rounding remainder to the first participant
  if (!remainder.isZero()) {
    splits[0] = splits[0].plus(remainder);
  }
  return splits;
}

export function calculatePercentageSplit(amountInr: Decimal, percentages: Decimal[]): Decimal[] {
  const splits = percentages.map(p => 
    amountInr.times(p).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  );
  const totalAllocated = splits.reduce((acc, val) => acc.plus(val), new Decimal(0));
  const remainder = amountInr.minus(totalAllocated);
  
  if (!remainder.isZero() && splits.length > 0) {
    splits[0] = splits[0].plus(remainder);
  }
  return splits;
}

export function calculateSharesSplit(amountInr: Decimal, shares: number[]): Decimal[] {
  const totalShares = shares.reduce((acc, val) => acc + val, 0);
  if (totalShares === 0) return Array(shares.length).fill(new Decimal(0));

  const count = new Decimal(totalShares);
  const splits = shares.map(share => 
    amountInr.times(new Decimal(share)).div(count).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  );

  const totalAllocated = splits.reduce((acc, val) => acc.plus(val), new Decimal(0));
  const remainder = amountInr.minus(totalAllocated);
  
  if (!remainder.isZero() && splits.length > 0) {
    splits[0] = splits[0].plus(remainder);
  }
  return splits;
}

// minimizeTransactions reduces the number of transactions required to settle all balances
export function minimizeTransactions(balancesMap: Map<string, Decimal>): { fromUserId: string, toUserId: string, amount: string }[] {
  const balances = Array.from(balancesMap.entries()).filter(([_, b]) => !b.isZero());
  
  const creditors = balances.filter(([_, b]) => b.gt(0))
                            .sort((a, b) => b[1].comparedTo(a[1]));
  
  const debtors = balances.filter(([_, b]) => b.lt(0))
                          .sort((a, b) => a[1].comparedTo(b[1]));

  const instructions: { fromUserId: string, toUserId: string, amount: string }[] = [];

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Decimal.min(creditor[1], debtor[1].abs());
    
    instructions.push({ 
      fromUserId: debtor[0], 
      toUserId: creditor[0], 
      amount: amount.toFixed(2) 
    });

    creditor[1] = creditor[1].minus(amount);
    debtor[1] = debtor[1].plus(amount);

    if (creditor[1].isZero()) i++;
    if (debtor[1].isZero()) j++;
  }

  return instructions;
}
