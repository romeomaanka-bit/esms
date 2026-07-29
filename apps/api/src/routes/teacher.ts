import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { ensureRole } from '../middleware/rbac'
import prisma from '../services/prisma'

const router = Router()
router.use(authenticateToken, ensureRole('TEACHER'))

router.get('/timetable', async (req: any, res) => {
  const teacherId = req.user.teacher?.id
  if (!teacherId) return res.status(403).json({ error: 'Teacher profile required' })
  const timetables = await prisma.timetable.findMany({ where: { teacherId }, include: { subject: true, class: true } })
  res.json(timetables)
})

router.post('/attendance', async (req: any, res) => {
  const { records } = req.body // expect array of { studentId, date, status }
  if (!Array.isArray(records)) return res.status(400).json({ error: 'records array required' })

  const created = []
  for (const r of records) {
    const att = await prisma.attendance.create({ data: { studentId: r.studentId, date: new Date(r.date), status: r.status, teacherId: req.user.teacher.id } })
    created.push(att)
  }

  res.status(201).json(created)
})

export default router
