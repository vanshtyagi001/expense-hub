// Vercel Serverless Function Handler
// Uses extensionless imports for Vercel's @vercel/node runtime compatibility.

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { eq, and, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as schema from './schema.js';

// --- Database Setup ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000,
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});
const db = drizzle(pool, { schema });

// --- Supabase Auth ---
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://sazuncuyunuusfvnhekl.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Auth Helper ---
async function getAuthUser(req: any): Promise<any | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return { uid: user.id, email: user.email, ...user };
  } catch {
    return null;
  }
}

// --- Ensure DB User ---
async function ensureDbUser(authUser: any) {
  let dbUser = await db.query.users.findFirst({ where: eq(schema.users.uid, authUser.uid) });
  if (!dbUser) {
    const id = randomUUID();
    await db.insert(schema.users).values({
      id,
      uid: authUser.uid,
      email: authUser.email || '',
      name: authUser.name || authUser.email?.split('@')[0] || 'Unknown',
    });
    dbUser = await db.query.users.findFirst({ where: eq(schema.users.uid, authUser.uid) });
  }
  return dbUser;
}

// --- Main Handler ---
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || '';
  const path = url.split('?')[0]; // Remove query params

  try {
    // --- Health Check ---
    if (path === '/api/health') {
      return res.json({
        status: 'ok',
        env: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          SUPABASE_URL: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
          SUPABASE_ANON_KEY: !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
        },
      });
    }

    // --- All other routes require auth ---
    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await ensureDbUser(authUser);
    if (!dbUser) return res.status(500).json({ error: 'Could not create user' });

    // --- GET /api/groups ---
    if (path === '/api/groups' && req.method === 'GET') {
      const members = await db.query.groupMembers.findMany({
        where: eq(schema.groupMembers.userId, dbUser.id),
        with: { group: true },
      });
      return res.json(members.map((m: any) => m.group));
    }

    // --- POST /api/groups ---
    if (path === '/api/groups' && req.method === 'POST') {
      const { name, description } = req.body as any;
      if (!name) return res.status(400).json({ error: 'Name is required' });

      const groupId = randomUUID();
      await db.insert(schema.groups).values({ id: groupId, name, description });

      const memberId = randomUUID();
      await db.insert(schema.groupMembers).values({
        id: memberId,
        groupId,
        userId: dbUser.id,
        joinedAt: new Date().toISOString(),
        role: 'ADMIN',
      });

      const newGroup = await db.query.groups.findFirst({ where: eq(schema.groups.id, groupId) });
      return res.json(newGroup);
    }

    // --- GET /api/groups/:groupId ---
    const groupMatch = path.match(/^\/api\/groups\/([^\/]+)$/);
    if (groupMatch && req.method === 'GET') {
      const groupId = groupMatch[1];
      const membership = await db.query.groupMembers.findFirst({
        where: and(eq(schema.groupMembers.groupId, groupId), eq(schema.groupMembers.userId, dbUser.id)),
      });
      if (!membership) return res.status(403).json({ error: 'Forbidden' });

      const groupData = await db.query.groups.findFirst({
        where: eq(schema.groups.id, groupId),
        with: { members: { with: { user: true } } },
      });
      return res.json(groupData);
    }

    // --- GET /api/groups/:groupId/members ---
    const membersMatch = path.match(/^\/api\/groups\/([^\/]+)\/members$/);
    if (membersMatch && req.method === 'GET') {
      const groupId = membersMatch[1];
      const members = await db.query.groupMembers.findMany({
        where: eq(schema.groupMembers.groupId, groupId),
        with: { user: true },
      });
      return res.json(members);
    }

    // --- POST /api/groups/:groupId/members ---
    if (membersMatch && req.method === 'POST') {
      const groupId = membersMatch[1];
      const { email } = req.body as any;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const targetUser = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      const existing = await db.query.groupMembers.findFirst({
        where: and(eq(schema.groupMembers.groupId, groupId), eq(schema.groupMembers.userId, targetUser.id)),
      });
      if (existing) return res.status(400).json({ error: 'User already a member' });

      const memberId = randomUUID();
      await db.insert(schema.groupMembers).values({
        id: memberId,
        groupId,
        userId: targetUser.id,
        joinedAt: new Date().toISOString(),
        role: 'MEMBER',
      });
      return res.json({ success: true });
    }

    // --- GET /api/groups/:groupId/expenses ---
    const expensesMatch = path.match(/^\/api\/groups\/([^\/]+)\/expenses$/);
    if (expensesMatch && req.method === 'GET') {
      const groupId = expensesMatch[1];
      const expenses = await db.query.expenses.findMany({
        where: eq(schema.expenses.groupId, groupId),
        with: { splits: true, paidBy: true },
        orderBy: (expenses: any, { desc }: any) => [desc(expenses.date)],
      });
      return res.json(expenses);
    }

    // --- POST /api/groups/:groupId/expenses ---
    if (expensesMatch && req.method === 'POST') {
      const groupId = expensesMatch[1];
      const body = req.body as any;
      const expenseId = randomUUID();
      await db.insert(schema.expenses).values({
        id: expenseId,
        groupId,
        description: body.description,
        amount: body.amount,
        currency: body.currency || 'INR',
        exchangeRate: body.exchangeRate,
        amountInr: body.amountInr || body.amount,
        date: body.date,
        paidById: body.paidById || dbUser.id,
        splitType: body.splitType || 'EQUAL',
        notes: body.notes,
      });

      // Insert splits
      if (body.splits && Array.isArray(body.splits)) {
        for (const split of body.splits) {
          await db.insert(schema.expenseSplits).values({
            id: randomUUID(),
            expenseId,
            userId: split.userId,
            amount: split.amount,
            percentage: split.percentage,
            shares: split.shares,
          });
        }
      }

      const newExpense = await db.query.expenses.findFirst({
        where: eq(schema.expenses.id, expenseId),
        with: { splits: true },
      });
      return res.json(newExpense);
    }

    // --- GET /api/groups/:groupId/balances ---
    const balancesMatch = path.match(/^\/api\/groups\/([^\/]+)\/balances$/);
    if (balancesMatch && req.method === 'GET') {
      const groupId = balancesMatch[1];
      const expenses = await db.query.expenses.findMany({
        where: eq(schema.expenses.groupId, groupId),
        with: { splits: true },
      });
      const members = await db.query.groupMembers.findMany({
        where: eq(schema.groupMembers.groupId, groupId),
        with: { user: true },
      });

      // Calculate balances
      const balances: Record<string, number> = {};
      members.forEach((m: any) => { balances[m.userId] = 0; });

      expenses.forEach((exp: any) => {
        if (exp.isDeleted) return;
        balances[exp.paidById] = (balances[exp.paidById] || 0) + parseFloat(exp.amountInr);
        exp.splits.forEach((split: any) => {
          balances[split.userId] = (balances[split.userId] || 0) - parseFloat(split.amount);
        });
      });

      const result = members.map((m: any) => ({
        userId: m.userId,
        userName: m.user?.name || 'Unknown',
        balance: balances[m.userId] || 0,
      }));
      return res.json(result);
    }

    // --- GET /api/groups/:groupId/settlements ---
    const settlementsMatch = path.match(/^\/api\/groups\/([^\/]+)\/settlements$/);
    if (settlementsMatch && req.method === 'GET') {
      const groupId = settlementsMatch[1];
      const settlements = await db.query.settlements.findMany({
        where: eq(schema.settlements.groupId, groupId),
        with: { fromUser: true, toUser: true },
      });
      return res.json(settlements);
    }

    // --- POST /api/groups/:groupId/settlements ---
    if (settlementsMatch && req.method === 'POST') {
      const groupId = settlementsMatch[1];
      const body = req.body as any;
      const settlementId = randomUUID();
      await db.insert(schema.settlements).values({
        id: settlementId,
        groupId,
        fromUserId: body.fromUserId,
        toUserId: body.toUserId,
        amount: body.amount,
        currency: body.currency || 'INR',
        date: body.date || new Date().toISOString(),
        notes: body.notes,
      });
      const settlement = await db.query.settlements.findFirst({
        where: eq(schema.settlements.id, settlementId),
      });
      return res.json(settlement);
    }

    // --- GET /api/user/analytics ---
    if (path === '/api/user/analytics' && req.method === 'GET') {
      const memberRecords = await db.query.groupMembers.findMany({
        where: eq(schema.groupMembers.userId, dbUser.id),
      });
      if (memberRecords.length === 0) {
        return res.json({ balance: 0, owed: 0, owes: 0, weekly: [], categories: [], hasData: false });
      }

      const groupIds = memberRecords.map((m: any) => m.groupId);
      const allExpenses = await db.query.expenses.findMany({
        where: inArray(schema.expenses.groupId, groupIds),
        with: { splits: true },
      });

      if (allExpenses.length === 0) {
        return res.json({ balance: 0, owed: 0, owes: 0, weekly: [], categories: [], hasData: false });
      }

      const categoryMap: Record<string, number> = {};
      const weekMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

      allExpenses.forEach((exp: any) => {
        const userSplit = exp.splits.find((s: any) => s.userId === dbUser.id);
        if (userSplit) {
          const amount = parseFloat(userSplit.amount);
          const cat = (exp as any).categoryId || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + amount;
          const date = new Date(exp.date);
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = days[date.getDay()];
          weekMap[dayName] = (weekMap[dayName] || 0) + amount;
        }
      });

      const colors = ['#00e013', '#000000', '#888888', '#d1d5db', '#0052ff', '#ff0000'];
      const categories = Object.keys(categoryMap)
        .map((k, i) => ({ name: k, value: categoryMap[k], color: colors[i % colors.length] }))
        .filter((c) => c.value > 0);

      const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        name: day,
        spend: weekMap[day] || 0,
      }));

      return res.json({ balance: 0, owed: 0, owes: 0, weekly, categories, hasData: categories.length > 0 });
    }

    // --- DELETE /api/user ---
    if (path === '/api/user' && req.method === 'DELETE') {
      await db.delete(schema.expenseSplits).where(eq(schema.expenseSplits.userId, dbUser.id));
      await db.delete(schema.expenses).where(eq(schema.expenses.paidById, dbUser.id));
      await db.delete(schema.settlements).where(eq(schema.settlements.fromUserId, dbUser.id));
      await db.delete(schema.settlements).where(eq(schema.settlements.toUserId, dbUser.id));
      await db.delete(schema.users).where(eq(schema.users.uid, authUser.uid));
      return res.json({ message: 'Account deleted successfully' });
    }

    // --- 404 ---
    return res.status(404).json({ error: 'Not found', path });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
