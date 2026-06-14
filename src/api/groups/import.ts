import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { db } from '../../db/index.ts';
import { groups, groupMembers, users, importSessions, importAnomalies, expenses, expenseSplits } from '../../db/schema.ts';
import { eq, and, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { processCsvUpload } from '../../lib/import/importer.ts';
import multer from 'multer';

// Use memory storage for fast parsing
const upload = multer({ storage: multer.memoryStorage() });
const router = Router({ mergeParams: true });

router.post('/', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No CSV file provided' });

    const csvContent = file.buffer.toString('utf-8');
    const today = new Date().toISOString().split('T')[0];
    
    const membersList = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: { user: true }
    });
    const memberEmails = membersList.map(m => (m.user as any)?.email);
    const memberNames = membersList.map(m => (m.user as any)?.name);

    const result = await processCsvUpload(csvContent, groupId, file.originalname, {
      today,
      groupMembers: [...memberEmails, ...memberNames]
    });

    const sessionId = randomUUID();
    
    await db.insert(importSessions).values({
      id: sessionId,
      groupId,
      filename: file.originalname,
      status: 'REVIEWING',
      totalRows: result.processedRows.length
    });

    const anomaliesToInsert = [];
    for (let i = 0; i < result.processedRows.length; i++) {
        const pr = result.processedRows[i];
        for (const anom of pr.anomalies) {
            anomaliesToInsert.push({
                id: randomUUID(),
                importSessionId: sessionId,
                rowNumber: i + 1,
                anomalyType: anom.anomalyType,
                severity: anom.severity,
                description: anom.description,
                originalData: pr.rawRow,
                suggestedFix: anom.suggestedFix,
                userAction: 'PENDING'
            });
        }
    }

    if (anomaliesToInsert.length > 0) {
      await db.insert(importAnomalies).values(anomaliesToInsert);
    }

    res.json({
        importSessionId: sessionId,
        status: 'REVIEWING',
        totalRows: result.processedRows.length,
        anomaliesCount: anomaliesToInsert.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:sessionId', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { sessionId } = req.params;
        const sessionData = await db.query.importSessions.findFirst({
            where: eq(importSessions.id, sessionId),
            with: { anomalies: true }
        });
        if (!sessionData) return res.status(404).json({ error: 'Session not found' });
        res.json(sessionData);
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:sessionId/resolve', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { sessionId } = req.params;
        const { resolutions } = req.body; // array of { anomalyId, action, resolvedData }
        
        // Simplistic implementation for bulk approve
        for (const resItem of resolutions) {
          await db.update(importAnomalies)
            .set({ userAction: resItem.action, reviewedAt: new Date().toISOString() })
            .where(eq(importAnomalies.id, resItem.anomalyId));
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:sessionId/commit', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { sessionId, groupId } = req.params;
        
        await db.update(importSessions).set({ status: 'PROCESSING' }).where(eq(importSessions.id, sessionId));

        // Fetch session
        const session = await db.query.importSessions.findFirst({
            where: eq(importSessions.id, sessionId),
            with: { anomalies: true } // Includes the anomalies and originalData
        });

        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Get group members mapping for creating splits and paying logic
        const membersList = await db.query.groupMembers.findMany({
            where: eq(groupMembers.groupId, groupId),
            with: { user: true }
        });
        
        // Quick lookup helpers
        const getUserIdByName = (name: string) => {
             const lowerName = name.toLowerCase().trim();
             return membersList.find(m => (m.user as any)?.name?.toLowerCase() === lowerName || (m.user as any)?.email?.toLowerCase() === lowerName)?.userId;
        };

        // Get all unique rows (anomalies with same rowNumber belong to the same expense row)
        // Group anomalies by row
        const rowDataMap = new Map();
        for (const anom of session.anomalies) {
             const rowNum = anom.rowNumber;
             if (!rowDataMap.has(rowNum)) {
                 rowDataMap.set(rowNum, {
                     originalData: anom.originalData,
                     userAction: anom.userAction,
                     isDiscarded: false
                 });
             }
             if (anom.userAction === 'DISCARD') {
                 rowDataMap.get(rowNum).isDiscarded = true;
             }
        }

        let skippedRows = 0;
        let importedRows = 0;

        for (const [rowNum, rowObj] of rowDataMap.entries()) {
            if (rowObj.isDiscarded) {
                skippedRows++;
                continue;
            }

            const raw = rowObj.originalData;
            
            // Normalize inputs
            let amountNum = parseFloat(raw.amount);
            if (isNaN(amountNum)) amountNum = 0;
            const currency = (raw.currency || 'INR').trim().toUpperCase();
            
            let rateNum = 1.0;
            if (currency === 'USD') rateNum = 83.00; // static exchange rate for prototype
            const amountInr = amountNum * rateNum;

            const paidById = getUserIdByName(raw.paid_by) || membersList[0].userId; // Fallback to first member if not found
            
            const rawDate = raw.date || new Date().toISOString();
            // Try to make valid date
            let validDate = new Date().toISOString();
            if (rawDate) {
                 const parsed = new Date(rawDate);
                 if (!isNaN(parsed.getTime())) {
                     validDate = parsed.toISOString();
                 }
            }

            const isSettlement = raw.description?.toLowerCase().includes('settlement');
            if (isSettlement) {
                 // Note: Ideally we insert settlements here, but for MVP let's just skip or treat as expense
                 skippedRows++;
                 continue;
            }

            const expenseId = randomUUID();
            await db.insert(expenses).values({
                id: expenseId,
                groupId,
                description: raw.description || 'Imported Expense',
                amount: amountNum.toString(),
                currency: currency,
                exchangeRate: rateNum === 1.0 ? null : rateNum.toString(),
                amountInr: amountInr.toString(),
                date: validDate,
                paidById,
                splitType: raw.split_type || 'equal',
                notes: raw.notes || ''
            });

            // Insert Splits (Simple assuming 'equal' for all if missing)
            // Advanced logic handled via normal app or here if needed
            // For MVP: We assume equal across all members if split_with is missing or complex
            const splitMembersStr = raw.split_with;
            let activeMembersForSplit = membersList;
            if (splitMembersStr) {
                const names = splitMembersStr.split(';').map((n: string) => n.trim().toLowerCase());
                activeMembersForSplit = membersList.filter(m => names.includes((m.user as any)?.name?.toLowerCase()));
            }

            if (activeMembersForSplit.length > 0) {
                 const splitAmount = amountInr / activeMembersForSplit.length;
                 for (const m of activeMembersForSplit) {
                     // Note expense splits table name requires schema import
                     await db.insert(expenseSplits).values({
                         id: randomUUID(),
                         expenseId,
                         userId: m.userId,
                         amount: splitAmount.toString()
                     });
                 }
            }
            importedRows++;
        }
        
        await db.update(importSessions).set({ 
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          importedRows: importedRows
        }).where(eq(importSessions.id, sessionId));

        res.json({ success: true, importedRows, skippedRows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
