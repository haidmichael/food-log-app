import bcryp from 'bcrypt' 
import jwt from 'jsonwebtoken' 
import prisma from '../prisma.js'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '../utils/email.js'

export const register = async (req, res) => {
    try {
        const { email, password, name, inviteCode } = req.body

        // ##### Check invite code #####
        if (inviteCode !== process.env.INVITE_CODE) {
            return res.status(403).json({ error: 'Invalid invite code' })
        }

        //##### Check if user already exists #####
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' })
        }

        //##### Hash the password - never store plain text #####
        const hashedPassword = await bcryp.hash(password, 10)

        //##### Create the User #####
        const user = await prisma.user.create({
            data: { 
                email, 
                password: hashedPassword, 
                name  
            }
        })

        //##### Return user without password #####
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } 
        )
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id, 
                email: user.email, 
                name: user.name
            }
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Registration failed' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body 

        //##### Find the user #####
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        //##### Compare Password against hash #####
        const passwordMatch = await bcryp.compare(password, user.password) 

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        //##### Sign a JWT #####
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } 
        )

        res.json({
            message: 'Login successfull', 
            token, 
            user: {
                id: user.id, 
                email: user.email, 
                name: user.name 
            }
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Login failed' })
    }
}

export const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.json({ message: 'If that email exists you will receive a reset link shortly' })
        }

        await prisma.passwordResetToken.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true }
        })

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt
            }
        })

        await sendPasswordResetEmail(user.email, user.name, token)

        res.json({ message: 'If that email exists you will receive a reset link shortly' })
        
    } catch (err) {
        console.error(err)
        res.send(500).json({ message: 'Failed to process reqeust' })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }, 
            include: { user: true }
        })

        if (!resetToken) {
            return res.status(400).json({ error: 'Invalid or expired reset link' })
        }

        if (resetToken.used) {
            return res.status(400).json({ error: 'Reset link already been used' })
        }

        if (resetToken.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Reset link has expired' })
        }

        const hashedPassword = await bcryp.hash(password, 10)

        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword }
        })

        await prisma.passwordResetToken.update({ 
            where: { token }, 
            data: { used: true }
        })

        res.json({ message: 'Password reset successfully' })
        
    } catch (err) {
        console.error(err)
        res.send(500).json({ message: 'Failed to process request' })
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const userId = req.user.userId

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return res.status(404).json({ error: 'User not found' })

        // Verify current password
        const match = await bcryp.compare(currentPassword, user.password)
        if (!match) return res.status(401).json({ error: 'Current password is incorrect' })

        // Hash new password
        const hashedPassword = await bcryp.hash(newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        res.json({ message: 'Password changed successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to change password' })
    }
}