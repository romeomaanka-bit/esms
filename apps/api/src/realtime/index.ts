import { Server } from 'socket.io'
import http from 'http'
import jwt from 'jsonwebtoken'
import prisma from '../services/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me'

export function initRealtime(server: http.Server) {
  const io = new Server(server, { cors: { origin: '*' } })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication error'))
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any
      const user = await prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) return next(new Error('Authentication error'))
      // attach minimal user to socket
      ;(socket as any).user = { id: user.id, role: user.role }
      next()
    } catch (err) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const user = (socket as any).user
    console.log('Realtime: user connected', user.id)
    socket.join(user.id)

    socket.on('disconnect', () => {
      console.log('Realtime: user disconnected', user.id)
    })
  })

  // expose io for other modules if needed
  ;(global as any).io = io
}
