import prisma from '../prisma.js'

// ***** Get all saved meals for the user *****
export const getSavedMeals = async (req, res) => {
    try {
        const meals = await prisma.savedMeal.findMany({
            where: { userId: req.user.userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        })
        res.json(('meals data', JSON.stringify(meals)))
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to get saved meals' })
    }
}

// ***** Get a single saved meal *****
export const getSavedMeal = async (req, res) => {
    try {
        const { id } = req.params

        const meal = await prisma.savedMeal.findUnique({
            where: { id },
            inclued: { item: true}
        })

        if (!meal) {
            return res.status(400).json({ error: 'Saved meal not found' })
        }

        if (meal.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' })
        }

        res.json(('meals data', JSON.stringify(meals)))
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to get saved meal'})
    }
}

// ***** Create a new saved meal *****
export const createSavedMeal = async (req, res) => {
    try {
        const { name, description, items } = req.body
        
        const meal = await prisma.savedMeal.create({
            data: {
                userId: req.user.userId,
                name,
                description,
                items: {
                    create: items
                }
            },
            include: { items: true }
        })

        res.status(201).json({
            message: 'Saved meal created', 
            meal: JSON.parse(JSON.stringify(meals))
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to create saved meal'})
    }
}

// ***** Delete a saved meal *****
export const deleteSavedMeal = async (req, res) => {
    try {
        const { id } = req.params

        const meal = await prisma.savedMeal.findUnique({
            where: { id }
        })

        if (!meal) {
            return res.status(404).json({ error: 'Saved meal not found' })
        }

        if (meal.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not Authorized' })
        }

        await prisma.savedMeal.delete({ where: { id } })
        res.json({ message: 'Saved meal deleted' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to delete saved meal' })
    }
}

// ***** Log a saved meal to the food log *****
export const logSavedMeal = async (req, res) => {
    try {
        const { id } = req.params
        const { date, meal } = req.body

        // Get the saved meal with items
        const savedMeal = await prisma.savedMeal.findUnique({
            where: { id },
            include: { items: true }
        })

        if (!savedMeal) {
            return res.status(404).json({ error: 'Saved meal not found' })
        }

        if (savedMeal.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized' })
        }

        // Log all items to the food log
        const entries = await prisma.foodLog.createMany({
            data: savedMeal.items.map(item => ({
                userId: req.user.userId,
                date: new Date(date),
                meal,
                foodName: item.foodName,
                servingSize: item.servingSize,
                servingUnit: item.servingUnit,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat
            }))
        })

        res.status(201).json({
            message: `${savedMeal.name} logged to ${meal}`,
            count: entries.count
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to log saved meal' })
    }
}