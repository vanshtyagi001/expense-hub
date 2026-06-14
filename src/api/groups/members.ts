import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { db } from '../../db/index.ts';
import { groupMembers, users, groups } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router({ mergeParams: true });

// GET /api/groups/:groupId/members
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    
    // Check group exists
    const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId) });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: {
        user: true
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/groups/:groupId/members
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    const { email, joinedAt } = req.body;
    
    // Find user by email
    const userToadd = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!userToadd) {
        return res.status(404).json({ error: 'User not found with this email' });
    }

    const newMemberId = randomUUID();
    await db.insert(groupMembers).values({
        id: newMemberId,
        groupId,
        userId: userToadd.id,
        joinedAt: joinedAt || new Date().toISOString(),
        role: 'MEMBER'
    });

    const newMember = await db.query.groupMembers.findFirst({
        where: eq(groupMembers.id, newMemberId),
        with: { user: true }
    });

    res.json(newMember);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
