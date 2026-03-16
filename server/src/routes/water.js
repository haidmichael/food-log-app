import { Router } from 'express' 
import { getWaterLog, addWaterEntry } from '../controllers/water.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router() 

router.get('/:date', authenticateToken, getWaterLog) 
router.post('/', authenticateToken, addWaterEntry)

export default router