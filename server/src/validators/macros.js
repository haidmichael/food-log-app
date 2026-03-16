import { z } from 'zod' 

export const macroGoalSchema = z.object({
    calories: z.number().int().positive('Calories must be a positive number'), 
    protein: z.number().positive('Protein must be a positive number'), 
    carbs: z.number().positive('Carbs must be a positive number'),
    fat: z.number().positive('Fat bumst be a positive number')
})