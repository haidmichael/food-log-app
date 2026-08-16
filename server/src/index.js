import dotenv from 'dotenv'
dotenv.config()

import { validateEnv } from './config/validateEnv.js'
validateEnv()

import express from 'express' 
import cors from 'cors' 
import { rateLimit, ipKeyGenerator } from 'express-rate-limit' 
import authRoutes from './routes/auth.js' 
import macroRoutes from './routes/macros.js' 
import foodRoutes from './routes/foods.js'
import waterRoutes from './routes/water.js'
import summaryRoutes from './routes/summary.js'
import searchRoutes from './routes/search.js'
import savedMealRoutes from './routes/savedMeals.js'
import aiRoutes from './routes/ai.js'
import communityFoodRoutes from './routes/communityFoods.js'

dotenv.config() 

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3000

// Middleware 
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json()) 

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: { error: 'Too many requests, please try again later.'}
})

// Strict Limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, 
    message: { error: 'Too many attempts, please try again in 15 minutes' },
    keyGenerator: (req) => ipKeyGenerator(req)
})

app.use('/api/', limiter) 
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)
app.use('/api/auth/reset-password', authLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/macros', macroRoutes)
app.use('/api/foods', foodRoutes)
app.use('/api/water', waterRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/saved-meals', savedMealRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/community-foods', communityFoodRoutes)

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Food Log API is running' })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong' })
})

app.listen(PORT, () => {
    console.log(`Server is working down here on http://localhost:${PORT}`)
})