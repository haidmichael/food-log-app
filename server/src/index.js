import dotenv from 'dotenv' 
import express from 'express' 
import cors from 'cors' 
import { rateLimit } from 'express-rate-limit' 
import authRoutes from './routes/auth.js' 
import macroRoutes from './routes/macros.js' 
import foodRoutes from './routes/foods.js'
import waterRoutes from './routes/water.js'
import summaryRoutes from './routes/summary.js'
import searchRoutes from './routes/search.js'

dotenv.config() 

const app = express() 
const PORT = process.env.PORT || 3000

// Middleware 
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', 
    credential: true
}))

app.use(express.json()) 

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: { error: 'Too many requests, please try again later.'}
})

app.use('/api/', limiter) 

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/macros', macroRoutes)
app.use('/api/foods', foodRoutes)
app.use('/api/water', waterRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/search', searchRoutes)

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