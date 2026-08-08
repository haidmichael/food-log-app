import { Router } from 'express'
import { searchCommunityFoods, saveCommunityFood, incrementFoodUseCount } from '../controllers/communityFoods.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const saveCommunityFoodSchema = z.object({
    name: z.string().min(1).max(200),
    brand: z.string().max(100).nullish(),
    servingSize: z.number().positive(),
    servingUnit: z.enum([
        'g', 'oz', 'cup', 'tbsp', 'tsp',
        'whole', 'piece', 'slice', 'bar',
        'link', 'links', 'serving', 'ml', 'l'
    ]),
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
    source: z.enum(['user', 'ai_verified', 'usda']).optional()
})

const router = Router()

router.get('/search', authenticateToken, searchCommunityFoods)
router.post('/', authenticateToken, validate(saveCommunityFoodSchema), saveCommunityFood)
router.patch('/:id/use', authenticateToken, incrementFoodUseCount)

export default router