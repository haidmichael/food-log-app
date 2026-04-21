import bcryp from 'bcrypt' 
import jwt from 'jsonwebtoken' 
import prisma from '../prisma.js' 

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
        res.status(201).json({
            message: 'User created successfully', 
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