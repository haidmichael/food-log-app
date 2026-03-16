import { Router } from 'express' 
import { register, login } from '../controllers/auth.js' 
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../validators/auth.js'

const router = Router() 

router.post('/register', validate(registerSchema), register) 
router.post('/login', validate(loginSchema), login) 

export default router 