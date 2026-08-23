import prisma from '../prisma.js'

// ##### Search Community Foods #####
export const searchCommunityFoods = async (req, res) => {
    try {
        const { query } = req.query
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' })
        }

        const foods = await prisma.communityFood.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive' // case insensitive search
                }
            },
            orderBy: [
                { useCount: 'desc' }, // most used foods first
                { createdAt: 'desc' } 
            ],
            take: 10 // max 10 results
        })

        res.json({ foods })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Community food search failed' })
    }
}

// ##### Save a Food to Community Database #####
export const saveCommunityFood = async (req, res) => {
    try {
        const { name, brand, servingSize, servingUnit, calories, protein, carbs, fat, source } = req.body
        const userId = req.user.userId

        // Check if food already exists (case insensitive)
        const existing = await prisma.communityFood.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            }
        })

        if (existing) { 
            // Increment userCount intead of creating duplicate
            const update = await prisma.communityFood.update({
                where: { id: existing.id },
                data: { useCount: { increment: 1 } }
            })
            return res.json({
                message: 'Food already exists - use count incremented',
                food: update,
                isExisting: true
            })
        }

        // Create new community food
        const food = await prisma.communityFood.create({
            data: {
                name,
                brand: brand || null,
                servingSize: Number(servingSize),
                servingUnit,
                calories: Number(calories),
                protein: Number(protein),
                carbs: Number(carbs),
                fat: Number(fat),
                source: source || 'user',
                createdBy: userId
            }
        })

        res.status(201).json({
            message: 'Food saved to community database',
            food,
            isExisting: false
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to save community food' })
    }
}

// ##### Increment use count when food is logged #####
export const incrementFoodUseCount = async (req, res) => {
    try {
        const { id } = req.params

        const food = await prisma.communityFood.findUnique({ where: { id } })
        if (!food) return res.status(404).json({ error: 'Food not found' })

        const update = await prisma.communityFood.update({
            where: { id },
            data: { useCount: { increment: 1 } }
        })

        res.json({ message: 'Use count updated', food: update })
        
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to update use count' })
    }
}