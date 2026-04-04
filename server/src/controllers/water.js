import prisma from "../prisma.js" 

export const getWaterLog = async (req, res) => {
    try {
        const { date } = req.params 

        const entries = await prisma.waterLog.findMany({
            where: {
                userId: req.user.userId, 
                date: new Date(date) 
            }
        })

        const total = entries.reduce((sum, entry) => sum + entry.amount, 0)

        res.json({
            entries, 
            total, 
            unit: 'oz' 
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to get water log' })
        
    }
}

export const addWaterEntry = async (req, res) => {
    try {
        const { date, amount, unit } = req.body

        const entry = await prisma.waterLog.create({
            data: {
                userId: req.user.userId, 
                date: new Date(date), 
                amount, 
                unit: unit || 'oz'
            }
        })

        res.status(201).json({
            message: 'Water entry added', 
            entry 
        })

    } catch (err) {
        console.error(err) 
        res.status(500).json({ error: 'Failed to get water log' }) 
    }
}

export const deleteWaterEntry = async (req, res) => {
    try {
        const { id } = req.params

        const entry = await prisma.waterLog.findUnique({
            where: { id }
        })

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' })
        }

        if ( entry.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this entry' })
        }

        await prisma.waterLog.delete({ where: { id }})
        res.json({ message: 'Water entry deleted' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to delete water entry' })
    }
}