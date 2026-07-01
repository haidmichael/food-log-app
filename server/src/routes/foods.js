import { Router } from 'express' 
import { getFoodLog, addFoodLog, deleteFoodEntry, updateFoodEntry, copyMealFromYesterday, saveAsMeal } from '../controllers/foods.js' 
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { foodEntrySchema, updateFoodSchema, copyMealSchema, saveAsMealSchema } from '../validators/foods.js'

const router = Router() 

router.get('/:date', authenticateToken, getFoodLog)
router.post('/', authenticateToken, validate(foodEntrySchema), addFoodLog) 
router.post('/copy', authenticateToken, validate(copyMealSchema), copyMealFromYesterday)
router.post('/save-as-meal', authenticateToken, validate(saveAsMealSchema), saveAsMeal)
router.delete('/:id', authenticateToken, deleteFoodEntry)
router.patch('/:id', authenticateToken, validate(updateFoodSchema), updateFoodEntry)

export default router