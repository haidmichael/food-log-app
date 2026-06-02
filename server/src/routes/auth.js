import { Router } from 'express' 
import { register, login, forgotPassword, resetPassword, changePassword } from '../controllers/auth.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/auth.js'

const router = Router() 

router.post('/register', validate(registerSchema), register) 
router.post('/login', validate(loginSchema), login)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)
router.post('/change-password', authenticateToken, validate(changePasswordSchema), changePassword)

export default router 