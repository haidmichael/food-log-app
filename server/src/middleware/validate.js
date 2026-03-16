export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)

    if(!result.success) {
        const errors = result.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }))
        return res.status(400).json({ errors })
    }

    res.body = result.data
    next() 
}