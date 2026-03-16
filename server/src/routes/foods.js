import { Router } from 'express' 
import { getFoodLog, addFoodLog, deleteFoodEntry } from '../controllers/foods.js' 
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { foodEntrySchema } from '../validators/foods.js'

const router = Router() 

router.get('/:date', authenticateToken, getFoodLog)
router.post('/', authenticateToken, validate(foodEntrySchema), addFoodLog) 
router.delete('/:id', authenticateToken, deleteFoodEntry)

export default router 