import { z } from 'zod';

export const RawExpenseRowSchema = z.object({
  date: z.string().optional().default(''),
  description: z.string().optional().default(''),
  amount: z.string().optional().default('0'),
  currency: z.string().optional().default('INR'),
  paid_by: z.string().optional().default(''),
  split_type: z.string().optional().default('equal'),
  split_with: z.string().optional().default(''),
  split_details: z.string().optional().default(''),
  notes: z.string().optional().default('')
});

export type ValidatedRow = z.infer<typeof RawExpenseRowSchema>;

export function validateRow(data: any): { success: true, data: ValidatedRow } | { success: false, error: z.ZodError } {
  const res = RawExpenseRowSchema.safeParse(data);
  return res;
}
