import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { db } from '../../db/index.ts';
import { settlements } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.params;
      const data = await db.query.settlements.findMany({
        where: eq(settlements.groupId, groupId),
        orderBy: [desc(settlements.date)]
      });
      res.json(data);
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { groupId } = req.params;
        const { fromUserId, toUserId, amount, date, notes } = req.body;

        const id = randomUUID();
        await db.insert(settlements).values({
            id,
            groupId,
            fromUserId,
            toUserId,
            amount: amount.toString(),
            date,
            notes
        });

        const settle = await db.query.settlements.findFirst({ where: eq(settlements.id, id) });
        res.json(settle);
    } catch(err) {
        res.status(500).json({ error: 'Server Exec' });
    }
});

export default router;
