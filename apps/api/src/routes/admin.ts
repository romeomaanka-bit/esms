import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { ensureRole } from '../middleware/rbac'
import prisma from '../services/prisma'

const router = Router()

// Protect all admin routes
router.use(authenticateToken, ensureRole('ADMIN'))

router.get('/teachers', async (_req, res) => {
  const teachers = await prisma.teacher.findMany({ include: { user: true } })
  res.json(teachers)
})

router.post('/teachers', async (req, res) => {
  const { username, password, fullName } = req.body
  if (!username || !password || !fullName) return res.status(400).json({ error: 'missing fields' })

  const bcrypt = await import('bcrypt')
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: 'TEACHER',
      profile: { create: { fullName } },
      teacher: { create: {} }
    },
    include: { profile: true }
  })

  res.status(201).json(user)
})

export default router
