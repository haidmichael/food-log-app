import prisma from "../prisma.js"

export const getFoodLog = async (req, res) => {
    try {
        const { date } = req.params 

        const entries = await prisma.foodLog.findMany({
            where: {
                userId: req.user.userId, 
                date: {
                    gte: new Date(date + 'T00:00:00.000Z'),
                    lte: new Date(date + 'T23:59:59.999Z')
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        res.json(entries)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to get food log' })
    }
}

export const addFoodLog = async (req, res) => {
    try {
        const { date, meal, foodName, servingSize, servingUnit, calories, protein, carbs, fat } = req.body

        const entry = await prisma.foodLog.create({
            data: {
                userId: req.user.userId, 
                date: new Date(date + 'T12:00:00.000Z'),
                meal,
                foodName,
                servingSize,
                servingUnit,
                calories, 
                protein, 
                carbs, 
                fat
            }
        })

        res.status(201).json({
            message: 'Food entry added', 
            entry 
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to get food entry' })
    }
}

export const deleteFoodEntry = async (req, res) => {
    try {
        const { id } = req.params

        const entry = await prisma.foodLog.findUnique({
            where: { id }
        })

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' })
        }

        if (entry.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this entry' })
        }

        await prisma.foodLog.delete({ where: { id } })

        res.json({ message: 'Entry deleted' })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to get food log' })
    }
}

export const moveFoodEntry = async (req, res) => {
    try {
        const { id } = req.params
        const { meal } = req.body

        const entry = await prisma.foodLog.findUnique({ where: { id } })

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' })
        }

        if (entry.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' })
        }

        const updated = await prisma.foodLog.update({
            where: { id }, 
            data: { meal }
        })

        res.json({ message: 'Food moved', entry: updated })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to move food entry' })
    }
}

export const copyMealFromYesterday = async (req, res) => {
    try {
        const { date, meal } = req.body
        const userId = req.user.userId

        // Calculate yesterday
        const today = new Date(date + 'T12:00:00')
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() -1)

        // Get yesterday's entries for this meal
        const yesterdayStart = new Date(yesterday)
        yesterdayStart.setUTCHours(0, 0, 0, 0)
        const yesterdayEnd = new Date(yesterday)
        yesterdayEnd.setUTCHours(23, 59, 59, 999)

        const entries = await prisma.foodLog.findMany({
            where: {
                userId, 
                meal, 
                date: {
                    gte: yesterdayStart, 
                    lte: yesterdayEnd
                }
            }
        })

        if (entries.length === 0) {
            return res.status(404).json({ error: `No ${meal} entries found for yesterday` })
        }

        // Copy entries to today
        const todayDate = new Date(date + 'T12:00:00')

        await prisma.foodLog.createMany({
            data: entries.map(entry => ({
                userId,
                date: todayDate,
                meal, 
                foodName: entry.foodName, 
                servingSize: entry.servingSize,
                calories: entry.calories,
                protein: entry.protein,
                carbs: entry.carbs,
                fat: entry.fat
            }))
        })

        res.status(201).json({
            message: `Copied ${entries.length} items from yesterday's ${meal}`,
            count: entries.length
        })

        
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to copy Meal' })
    }
}