import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../services/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me'

export interface AuthRequest extends Request {
  user?: any
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Missing token' })

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    req.user = user
    next()
  } catch (err) {
    console.error('Token error', err)
    return res.status(401).json({ error: 'Invalid token' })
  }
}
