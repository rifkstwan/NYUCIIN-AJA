// lib/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export type AuthPayload = {
  id: string
  role: string
}

export function getAuthUser(req: NextRequest): AuthPayload | null {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.split(' ')[1]
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) {
    return {
      error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      user: null,
    }
  }
  return { error: null, user }
}

export function requireAdmin(req: NextRequest) {
  const { error, user } = requireAuth(req)
  if (error || !user) return { error, user: null }

  if (user.role !== 'ADMIN') {
    return {
      error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }),
      user: null,
    }
  }
  return { error: null, user }
}