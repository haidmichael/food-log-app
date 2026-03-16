import { Router } from 'express' 
import { getMacroGoals, setMacroGoals } from '../controllers/macros.js' 
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { macroGoalSchema } from '../validators/macros.js'

const router = Router() 

router.get('/', authenticateToken, getMacroGoals) 
router.post('/', authenticateToken, validate(macroGoalSchema), setMacroGoals) 

export default router 