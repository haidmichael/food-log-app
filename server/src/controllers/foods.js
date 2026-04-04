import prisma from "../prisma.js"

export const getFoodLog = async (req, res) => {
    try {
        const { date } = req.params 

        const entries = await prisma.foodLog.findMany({
            where: {
                userId: req.user.userId, 
                date: new Date(date)
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
    console.log('addFoodEntry body:...', req.body)
    try {
        const { date, foodName, calories, protein, carbs, fat } = req.body

        const entry = await prisma.foodLog.create({
            data: {
                userId: req.user.userId, 
                date: new Date(date),
                foodName, 
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
        res.status(500).json({ error: 'Failed to get food log' })
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