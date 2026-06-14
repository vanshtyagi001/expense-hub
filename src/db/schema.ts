import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, decimal, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // We can use cuid or uuid here
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groups = pgTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groupMembers = pgTable('group_members', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  joinedAt: timestamp('joined_at', { mode: 'string' }).notNull(),
  leftAt: timestamp('left_at', { mode: 'string' }),
  role: text('role').default('MEMBER').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('INR').notNull(),
  exchangeRate: decimal('exchange_rate', { precision: 10, scale: 6 }),
  amountInr: decimal('amount_inr', { precision: 12, scale: 2 }).notNull(),
  date: timestamp('date', { mode: 'string' }).notNull(),
  paidById: text('paid_by_id').references(() => users.id).notNull(),
  splitType: text('split_type').notNull(),
  notes: text('notes'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  importRowRef: text('import_row_ref'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenseSplits = pgTable('expense_splits', {
  id: text('id').primaryKey(),
  expenseId: text('expense_id').references(() => expenses.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }),
  shares: integer('shares'),
});

export const settlements = pgTable('settlements', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  fromUserId: text('from_user_id').references(() => users.id).notNull(),
  toUserId: text('to_user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('INR').notNull(),
  date: timestamp('date', { mode: 'string' }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const importSessions = pgTable('import_sessions', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => groups.id).notNull(),
  filename: text('filename').notNull(),
  status: text('status').default('PENDING').notNull(), // PENDING, REVIEWING, PROCESSING, COMPLETED, FAILED
  totalRows: integer('total_rows').default(0).notNull(),
  importedRows: integer('imported_rows').default(0).notNull(),
  skippedRows: integer('skipped_rows').default(0).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at', { mode: 'string' }),
  reportJson: jsonb('report_json'),
});

export const importAnomalies = pgTable('import_anomalies', {
  id: text('id').primaryKey(),
  importSessionId: text('import_session_id').references(() => importSessions.id, { onDelete: 'cascade' }).notNull(),
  rowNumber: integer('row_number').notNull(),
  anomalyType: text('anomaly_type').notNull(),
  severity: text('severity').default('WARNING').notNull(), // ERROR, WARNING, INFO
  description: text('description').notNull(),
  originalData: jsonb('original_data').notNull(),
  suggestedFix: jsonb('suggested_fix'),
  userAction: text('user_action').default('PENDING').notNull(), // PENDING, AUTO_FIXED, USER_APPROVED, USER_REJECTED, SKIPPED
  resolvedData: jsonb('resolved_data'),
  reviewedAt: timestamp('reviewed_at', { mode: 'string' }),
});

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(groupMembers),
  paidExpenses: many(expenses),
  splits: many(expenseSplits),
  sentSettlements: many(settlements, { relationName: 'SettlementFrom' }),
  rcvdSettlements: many(settlements, { relationName: 'SettlementTo' }),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  expenses: many(expenses),
  settlements: many(settlements),
  importSessions: many(importSessions),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, { fields: [expenses.groupId], references: [groups.id] }),
  paidBy: one(users, { fields: [expenses.paidById], references: [users.id] }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, { fields: [expenseSplits.expenseId], references: [expenses.id] }),
  user: one(users, { fields: [expenseSplits.userId], references: [users.id] }),
}));
