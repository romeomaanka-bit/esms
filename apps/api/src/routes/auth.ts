import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../services/prisma'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

  // store session
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour default
  await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
})

router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  res.json({ ok: true })
})

export default router
