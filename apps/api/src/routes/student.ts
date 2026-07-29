import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { ensureRole } from '../middleware/rbac'
import prisma from '../services/prisma'

const router = Router()
router.use(authenticateToken, ensureRole('STUDENT'))

router.get('/profile', async (req: any, res) => {
  const studentId = req.user.student?.id
  if (!studentId) return res.status(403).json({ error: 'Student profile required' })
  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { user: true, attendances: true, results: true } })
  res.json(student)
})

router.post('/complaints', async (req: any, res) => {
  const studentId = req.user.student?.id
  if (!studentId) return res.status(403).json({ error: 'Student profile required' })
  const { subject, description } = req.body
  const complaint = await prisma.complaint.create({ data: { studentId, subject, description } })
  res.status(201).json(complaint)
})

export default router
