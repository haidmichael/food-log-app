import { z } from 'zod' 

export const createSavedMealSchema = z.object({
    name: z.string().min(1, 'Meal name is required').max(100),
    description: z.string().max(200).optional(),
    items: z.array(z.object({
        foodName: z.string().min(1, 'Food name is required'),
        servingSize: z.number().positive('Serving size must be grater than 0'),
        servingUnit: z.enum(['g', 'oz']),
        calories: z.number().nonnegative(),
        protein: z.number().nonnegative(),
        carbs: z.number().nonnegative(),
        fat: z.number().nonnegative(),
    })).min(1, 'Meal must have at least one item')
})

export const logSavedMealSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
})