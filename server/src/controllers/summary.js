import prisma from '../prisma.js'

export const getDailySummary = async (req, res) => {
    try {
        const { date } = req.params
        const userId = req.user.userId

        //##### Run all three queries simultaneously #####
        const [goals, foodEntries, waterEntries] = await Promise.all([
            prisma.macroGoal.findUnique({
                where: { userId }
            }), 
            prisma.foodLog.findMany({
                where: {
                    userId, 
                    date: new Date(date) 
                }
            }), 
            prisma.waterLog.findMany({
                where: {
                    userId, 
                    date: new Date(date) 
                }
            })
        ])

        //##### Calculate totals consumed #####
        const consumed = foodEntries.reduce(
            (totals, entry) => ({
                calories: totals.calories + entry.calories, 
                protein:  totals.protein  + entry.protein, 
                carbs:    totals.carbs    + entry.carbs, 
                fat:      totals.fat      + entry.fat 
            }), 
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        )

        //##### Calculate water total #####
        const waterTotal = waterEntries.reduce(
            (sum, entry) => sum + entry.amount, 0
        )

        //##### Calculate water total #####
        const remaining = goals ? { 
            calories: goals.calories - consumed.calories, 
            protein: goals.protein - consumed.protein, 
            carbs: goals.carbs - consumed.carbs, 
            fat: goals.fat - consumed.fat 
        } : null 

        res.json({
            date, 
            goals: goals || null, 
            consumed, 
            remaining, 
            water: { 
                entries: waterEntries, 
                total: waterTotal, 
                unit: 'oz'
            }, 
            foodEntries
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to get daily sumary' })
    }
}