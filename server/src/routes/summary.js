import { Router } from 'express' 
import { getDailySummary  } from '../controllers/summary.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router() 

router.get('/:date', authenticateToken, getDailySummary) 

export default router