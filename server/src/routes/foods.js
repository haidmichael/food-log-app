import { Router } from 'express' 
import { getFoodLog, addFoodLog, deleteFoodEntry } from '../controllers/foods.js' 
import { authenticateToken } from '../middleware/auth.js'

const router = Router() 

router.get('/:date', authenticateToken, getFoodLog)
router.post('/', authenticateToken, addFoodLog) 
router.delete('/:id', authenticateToken, deleteFoodEntry)

export default router 