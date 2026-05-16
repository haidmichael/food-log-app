import { Resend } from 'resend' 

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendPasswordResetEmail = async (email, name, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`

    await resend.emails.send({
        from: 'Chomp Tracker <noreply@noreply.chomptracker.com>',
        to: email,
        subject: 'Reset your Chomp Tracker password',
        html: `
            <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;'>
                <h2 style='color: #1F4E79;'>🥗 Chomp Tracker</h2>
                <p>We received a request to reset your password. Click the button below to create a new one:</p>
                <a href='${resetUrl}'
                    style='display: inline-block; padding: 12px 24px; background: #2E75B6; 
                    color: white; text-decoration: none; border-radius: 6px; 
                    font-weight: 500; margin: 16px 0;'>
                    Reset Password
                </a>
                <p style='color: #888; font-size: 13px;'>
                    This link expires in 1 hour. If you didn't request a password reset
                    you can safely ignore this email.
                </p>
                <p style='color: #888; font-size: 12px'>
                    Or copy this link: ${resetUrl}
                </p>
            </div>
        `
    })
}