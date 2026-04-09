export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body)
    req.body = parsed
    next()
  } catch (err) {
    const errors = err.issues?.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    })) || [{ field: 'unknown', message: 'Validation failed' }]
    return res.status(400).json({ errors })
  }
}