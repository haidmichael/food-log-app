const requiredEnvVars = [
    'DATABASE_URL', 
    'JWT_SECRET', 
    'CLIENT_URL',
    'ANTHROPIC_API_KEY',
    'RESEND_API_KEY',
    'INVITE_CODE'
]

export const validateEnv = () => {
    const missing = requiredEnvVars.filter(key => !process.env[key])

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:')
        missing.forEach(key => console.error(`  - ${key}`))
        console.error('\nAdd these to your .env file and restart the server.')
        process.exit(1)
    }

    console.log('✅ Environment variables validated')
}