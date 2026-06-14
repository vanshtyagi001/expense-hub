import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { db } from '../../db/index.ts';
import { groups, groupMembers, users } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import importRouter from './import.ts';

const router = Router();

router.use('/:groupId/import', importRouter);

// GET /api/groups - List groups for current user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    // ensure user exists in our db or create them
    let dbUser = await db.query.users.findFirst({ where: eq(users.uid, uid) });
    if (!dbUser) {
      // create user just in time if not exists
      const id = randomUUID();
      await db.insert(users).values({
        id,
        uid,
        email: req.user!.email || '',
        name: req.user!.name || req.user!.email?.split('@')[0] || 'Unknown',
      });
      dbUser = await db.query.users.findFirst({ where: eq(users.uid, uid) });
    }

    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, dbUser!.id),
      with: {
        group: true
      }
    });

    res.json(members.map(m => m.group));
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/groups - Create a new group
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const dbUser = await db.query.users.findFirst({ where: eq(users.uid, uid) });
    const { name, description } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const groupId = randomUUID();
    await db.insert(groups).values({
      id: groupId,
      name,
      description
    });

    const memberId = randomUUID();
    await db.insert(groupMembers).values({
      id: memberId,
      groupId,
      userId: dbUser!.id,
      joinedAt: new Date().toISOString(),
      role: 'ADMIN' // creator is admin
    });

    const newGroup = await db.query.groups.findFirst({
      where: eq(groups.id, groupId)
    });

    res.json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/groups/:groupId
router.get('/:groupId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    const uid = req.user!.uid;
    const dbUser = await db.query.users.findFirst({ where: eq(users.uid, uid) });
    
    // Check membership
    const membership = await db.query.groupMembers.findFirst({
      where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, dbUser!.id))
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const groupData = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      with: {
        members: {
          with: { user: true }
        }
      }
    });

    res.json(groupData);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
