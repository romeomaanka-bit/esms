import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../services/prisma'
import { randomBytes } from 'crypto'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10)
const isProd = process.env.NODE_ENV === 'production'

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  // access token ~15m
  res.cookie('esms_at', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  })

  // refresh token ~ REFRESH_DAYS
  res.cookie('esms_rt', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
  })
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

  const refreshToken = randomBytes(48).toString('hex')
  const refreshHash = await bcrypt.hash(refreshToken, 12)
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: refreshHash,
      userAgent: req.headers['user-agent'] as string | undefined,
      ip: req.ip,
      expiresAt,
    },
  })

  setAuthCookies(res, accessToken, refreshToken)

  res.json({ user: { id: user.id, username: user.username, role: user.role } })
})

router.post('/refresh', async (req, res) => {
  const provided = req.cookies?.esms_rt as string | undefined
  if (!provided) return res.status(401).json({ error: 'Missing refresh token' })

  // find active sessions that match the provided token
  const sessions = await prisma.session.findMany({
    where: { revoked: false, expiresAt: { gt: new Date() } },
  })

  let found: any = null
  for (const s of sessions) {
    if (!s.refreshTokenHash) continue
    // eslint-disable-next-line no-await-in-loop
    const ok = await bcrypt.compare(provided, s.refreshTokenHash)
    if (ok) {
      found = s
      break
    }
  }

  if (!found) {
    // potential token reuse/compromise — optionally revoke all sessions for user
    return res.status(401).json({ error: 'Invalid refresh token' })
  }

  const user = await prisma.user.findUnique({ where: { id: found.userId } })
  if (!user) return res.status(401).json({ error: 'Invalid session' })

  // rotate refresh token: replace stored hash, update expiresAt
  const newRefresh = randomBytes(48).toString('hex')
  const newHash = await bcrypt.hash(newRefresh, 12)
  const newExpiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.update({
    where: { id: found.id },
    data: { refreshTokenHash: newHash, expiresAt: newExpiresAt },
  })

  const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  setAuthCookies(res, accessToken, newRefresh)

  res.json({ user: { id: user.id, username: user.username, role: user.role } })
})

router.post('/logout', async (req, res) => {
  const provided = req.cookies?.esms_rt as string | undefined
  if (provided) {
    const sessions = await prisma.session.findMany({ where: { revoked: false } })
    for (const s of sessions) {
      if (!s.refreshTokenHash) continue
      // eslint-disable-next-line no-await-in-loop
      const ok = await bcrypt.compare(provided, s.refreshTokenHash)
      if (ok) {
        await prisma.session.update({ where: { id: s.id }, data: { revoked: true } })
        break
      }
    }
  }

  // Clear cookies in response
  res.clearCookie('esms_at')
  res.clearCookie('esms_rt')

  res.json({ ok: true })
})

export default router
