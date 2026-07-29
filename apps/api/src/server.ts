import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { initRealtime } from './realtime'
import authRoutes from './routes/auth'
import adminRoutes from './routes/admin'
import teacherRoutes from './routes/teacher'
import studentRoutes from './routes/student'

dotenv.config()

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/student', studentRoutes)

app.get('/health', (_req, res) => res.json({ ok: true }))

const port = process.env.PORT || 4000
const server = createServer(app)

initRealtime(server)

server.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
