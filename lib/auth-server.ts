// lib/auth-server.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface JWTPayload {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
  name: string
}

// Untuk API Routes (pakai NextRequest)
export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  try {
    // Coba Authorization Bearer header dulu (dipakai frontend via getToken())
    const authHeader = req.headers.get('authorization') ?? ''
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
      return payload
    }
    // Fallback: cookie
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return payload
  } catch {
    return null
  }
}

// Untuk Server Components (pakai cookies() dari next/headers)
export async function getUserFromCookies(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return payload
  } catch {
    return null
  }
}

// Helper cek role admin
export async function requireAdmin(req: NextRequest): Promise<JWTPayload | null> {
  const user = await getUserFromRequest(req)
  if (!user || user.role !== 'ADMIN') return null
  return user
}