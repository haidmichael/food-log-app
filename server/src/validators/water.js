import { z } from 'zod' 

export const waterEntrySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    amount: z.number().positive('Amount must be greater than 0'),
    protein: z.enum(['oz', 'ml']).optional().default('oz')
})