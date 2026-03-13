import { Router } from 'express' 
import { getMacroGoals, setMacroGoals } from '../controllers/macros.js' 
import { authenticateToken } from '../middleware/auth.js'

const router = Router() 

router.get('/', authenticateToken, getMacroGoals) 
router.post('/', authenticateToken, setMacroGoals) 

export default router 