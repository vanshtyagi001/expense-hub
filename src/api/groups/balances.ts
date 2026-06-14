import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { db } from '../../db/index.ts';
import { expenses, expenseSplits, settlements, groupMembers, users } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import Decimal from 'decimal.js';
import { minimizeTransactions } from '../../lib/balance.ts';

const router = Router({ mergeParams: true });

// GET /api/groups/:groupId/balances
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    
    // Fetch all active members
    const members = await db.query.groupMembers.findMany({
        where: eq(groupMembers.groupId, groupId),
        with: { user: true }
    });

    // Fetch all expenses and their splits in the group
    const groupExpenses = await db.query.expenses.findMany({
        where: eq(expenses.groupId, groupId),
        with: {
            splits: true
        }
    });

    // Fetch all settlements
    const groupSettlements = await db.query.settlements.findMany({
        where: eq(settlements.groupId, groupId)
    });

    const balances = new Map<string, Decimal>();
    members.forEach(m => balances.set(m.userId, new Decimal(0)));

    for (const exp of groupExpenses) {
        // Payer gets credit
        if (balances.has(exp.paidById)) {
            balances.set(exp.paidById, balances.get(exp.paidById)!.plus(new Decimal(exp.amountInr)));
        }

        // Each split participant is debited
        const splits = (exp.splits as any[]) || [];
        for (const split of splits) {
            if (balances.has(split.userId)) {
                 balances.set(split.userId, balances.get(split.userId)!.minus(new Decimal(split.amount)));
            }
        }
    }

    for (const settle of groupSettlements) {
        // Debtor reduces their debt (credit to themselves)
        if (balances.has(settle.fromUserId)) {
            balances.set(settle.fromUserId, balances.get(settle.fromUserId)!.plus(new Decimal(settle.amount)));
        }
        // Creditor's owed amount reduces
        if (balances.has(settle.toUserId)) {
            balances.set(settle.toUserId, balances.get(settle.toUserId)!.minus(new Decimal(settle.amount)));
        }
    }

    const memberBalances = members.map(m => {
        const net = balances.get(m.userId)!.toNumber();
        const user = m.user as any;
        return {
            userId: m.userId,
            name: user?.name,
            email: user?.email,
            netBalance: net
        };
    });

    const settlementPlan = minimizeTransactions(balances);
    
    // enhance settlement plan with names
    const planWithNames = settlementPlan.map(sp => {
        const fromUser = members.find(m => m.userId === sp.fromUserId)?.user as any;
        const toUser = members.find(m => m.userId === sp.toUserId)?.user as any;
        return {
            ...sp,
            fromName: fromUser?.name || 'Unknown',
            toName: toUser?.name || 'Unknown'
        };
    });

    res.json({
        memberBalances,
        settlementPlan: planWithNames
    });

  } catch (error) {
    console.error('Error calculating balances:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
