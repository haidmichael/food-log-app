import { Router } from 'express' 
import {
    getSavedMeals,
    getSavedMeal,
    createSavedMeal,
    deleteSavedMeal,
    logSavedMeal
} from '../controllers/savedMeals.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createSavedMealSchema, logSavedMealSchema } from '../validators/savedMeals.js'

const router = Router() 


router.get('/', authenticateToken, getSavedMeals)
router.get('/:id', authenticateToken, getSavedMeal)
router.post('/', authenticateToken, validate(createSavedMealSchema), createSavedMeal)
router.delete('/:id', authenticateToken, deleteSavedMeal)
router.post('/:id/log', authenticateToken, validate(logSavedMealSchema), logSavedMeal)

export default router