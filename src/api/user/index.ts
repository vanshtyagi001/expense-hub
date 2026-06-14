import express from "express";
import { db } from "../../db/index.ts";
import { users, expenses, expenseSplits, settlements, groupMembers, groups } from "../../db/schema.ts";
import { eq, inArray, and, gte, sum, sql } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../../middleware/auth.ts";

const router = express.Router();

router.get('/analytics', requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await db.query.users.findFirst({ where: eq(users.uid, userId) });
    if (!user) return res.json({ balance: 0, owed: 0, owes: 0, weekly: [], categories: [] });

    // Find all groups user belongs to
    const memberRecords = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, user.id)
    });
    
    if (memberRecords.length === 0) {
      return res.json({ balance: 0, owed: 0, owes: 0, weekly: [], categories: [] });
    }

    const groupIds = memberRecords.map(m => m.groupId);

    const allExpenses = await db.query.expenses.findMany({
      where: inArray(expenses.groupId, groupIds),
      with: {
        splits: true
      }
    });

    if (allExpenses.length === 0) {
      return res.json({ balance: 0, owed: 0, owes: 0, weekly: [], categories: [], hasData: false });
    }

    let hasData = true;
    let categoryMap: Record<string, number> = {};
    let weekMap: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

    allExpenses.forEach(exp => {
       const userSplit = exp.splits.find(s => s.userId === user.id);
       if (userSplit) {
         // User is involved in this expense
         const amount = parseFloat(userSplit.amount);
         
         // Aggregate categories
         const cat = exp.categoryId || 'Other';
         categoryMap[cat] = (categoryMap[cat] || 0) + amount;

         // Aggregate weekly (simplified: just map day of week)
         const date = new Date(exp.date);
         const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
         const dayName = days[date.getDay()];
         weekMap[dayName] = (weekMap[dayName] || 0) + amount;
       }
    });

    const colors = ['#00e013', '#000000', '#888888', '#d1d5db', '#0052ff', '#ff0000'];
    const categories = Object.keys(categoryMap).map((k, i) => ({
      name: k,
      value: categoryMap[k],
      color: colors[i % colors.length]
    })).filter(c => c.value > 0);

    const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day,
      spend: weekMap[day] || 0
    }));

    return res.json({ 
       balance: 0, 
       owed: 0, 
       owes: 0, 
       weekly, 
       categories,
       hasData: categories.length > 0
    });
  } catch (error) {
     console.error("Error fetching analytics:", error);
     res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/", requireAuth, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Since users is referenced by UUID locally, let's delete them by their uid / id
    // First let's verify if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.uid, userId)
    });

    if (user) {
       const dbId = user.id;
       
       // Forcefully delete related records because we don't have CASCADE on all foreign keys
       // Delete expense splits involving this user
       await db.delete(expenseSplits).where(eq(expenseSplits.userId, dbId));
       
       // Delete expenses paid by this user (which will cascade to expense splits because expense_splits.expense_id has CASCADE)
       await db.delete(expenses).where(eq(expenses.paidById, dbId));

       // Delete settlements from/to this user
       await db.delete(settlements).where(eq(settlements.fromUserId, dbId));
       await db.delete(settlements).where(eq(settlements.toUserId, dbId));

       // Delete the user
       await db.delete(users).where(eq(users.uid, userId));
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete account: " + errorMessage });
  }
});

export default router;
