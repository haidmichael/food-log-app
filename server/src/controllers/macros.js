import prisma from '../prisma.js' 

export const getMacroGoals = async (req, res) => {
    try {
        const goals = await prisma.macroGoal.findUnique({
            where: { userId: req.user.userId } 
        })

        if (!goals) {
            return res.status(404).json({ error: 'No macro goals set yet' })
        }

        res.json(goals) 

    } catch (err) {
        console.error(err) 
        res.status(500).json({ error: 'Failed to get macro goals' })
    }
}

export const setMacroGoals = async (req, res) => {
    try {
        const { calories, protein, carbs, fat } = req.body

        //##### Upsert means update if exists, create if not #####
        const goals = await prisma.macroGoal.upsert({
            where: { userId: req.user.userId }, 
            update: { calories, protein, carbs, fat }, 
            create: {
                userId: req.user.userId, 
                calories, 
                protein, 
                carbs, 
                fat 
            }
        })

        res.json({ 
            message: 'Macro goals saved', 
            goals
        })

    } catch (err) {
        console.error(err) 
        res.status(500).json({ error: 'Failed to get macro goals' })
    }

}