import { z } from 'zod' 

export const foodEntrySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    foodName: z.string().min(1, 'Food name is required').max(100), 
    calories: z.number().nonnegative('Calories must be 0 or more'),
    protein: z.number().nonnegative('Protein must be 0 or more'),
    carbs: z.number().nonnegative('Carbs must be 0 or more'),
    fat: z.number().nonnegative('Fat must be 0 or more')
})