import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { db } from '../../db/index.ts';
import { expenses, expenseSplits, users } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router({ mergeParams: true });

// GET /api/groups/:groupId/expenses
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    
    const expensesList = await db.query.expenses.findMany({
      where: eq(expenses.groupId, groupId),
      orderBy: [desc(expenses.date)],
      with: {
        paidBy: true,
        splits: {
            with: { user: true }
        }
      }
    });

    res.json({ expenses: expensesList });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/groups/:groupId/expenses
router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { groupId } = req.params;
        const { description, amount, currency, date, paidById, splitType, splits, notes, exchangeRate } = req.body;

        const expenseId = randomUUID();
        const amountNum = parseFloat(amount);
        let rateNum = parseFloat(exchangeRate);
        if (isNaN(rateNum) || rateNum <= 0) {
            rateNum = currency === 'USD' ? 83.00 : 1.0;
        }
        const amountInr = currency === 'USD' ? amountNum * rateNum : amountNum;

        await db.insert(expenses).values({
            id: expenseId,
            groupId,
            description,
            amount: amountNum.toString(),
            currency: currency || 'INR',
            exchangeRate: currency === 'USD' ? rateNum.toString() : null,
            amountInr: amountInr.toString(),
            date,
            paidById,
            splitType,
            notes,
        });

        if (splits && Array.isArray(splits)) {
            for (const split of splits) {
                await db.insert(expenseSplits).values({
                    id: randomUUID(),
                    expenseId,
                    userId: split.userId,
                    amount: split.amount.toString(),
                    percentage: split.percentage?.toString(),
                    shares: split.shares
                });
            }
        }

        const newExpense = await db.query.expenses.findFirst({
            where: eq(expenses.id, expenseId),
            with: { splits: true, paidBy: true }
        });

        res.json(newExpense);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

export default router;
