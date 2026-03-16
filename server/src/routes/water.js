import { Router } from 'express' 
import { getWaterLog, addWaterEntry } from '../controllers/water.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { waterEntrySchema } from '../validators/water.js'

const router = Router() 

router.get('/:date', authenticateToken, getWaterLog) 
router.post('/', authenticateToken, validate(waterEntrySchema), addWaterEntry)

export default router