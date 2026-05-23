import { Router } from 'express'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'
import { parseFoodDescription } from '../controllers/ai.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const parseFoodSchema = z.object({
  description: z.string().min(2, 'Please describe what you ate').max(500)
})

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,             // max 10 AI requests per minute per user
  keyGenerator: (req) => req.user?.userId || ipKeyGenerator(req),
  message: { error: 'Too many AI requests, please slow down' }
})

const router = Router()

router.post('/parse-food', authenticateToken, aiLimiter, validate(parseFoodSchema), parseFoodDescription)

export default router