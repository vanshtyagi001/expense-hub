import { z } from 'zod';

export const RawExpenseRowSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().optional().default('INR'),
  paid_by: z.string().min(1, 'Paid by is required'),
  split_type: z.enum(['equal', 'exact', 'percentage', 'share', 'shares', 'unequal']).default('equal'),
  split_with: z.string().optional(),
  split_details: z.string().optional(),
  notes: z.string().optional()
});

export type ValidatedRow = z.infer<typeof RawExpenseRowSchema>;

export function validateRow(data: any): { success: true, data: ValidatedRow } | { success: false, error: z.ZodError } {
  const res = RawExpenseRowSchema.safeParse(data);
  return res;
}
