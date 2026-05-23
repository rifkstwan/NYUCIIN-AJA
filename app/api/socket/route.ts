// app/api/socket/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { setIO } from '@/lib/socket'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // @ts-ignore
  const res = req as any

  if (!global.io) {
    console.log('🔌 Initializing Socket.io server...')

    // @ts-ignore
    const httpServer: HTTPServer = res.socket?.server

    if (!httpServer) {
      return NextResponse.json(
        { message: 'HTTP server not available' },
        { status: 500 }
      )
    }

    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    io.on('connection', (socket) => {
      console.log('✅ Client connected:', socket.id)

      // User join room berdasarkan orderId
      socket.on('join-order', (orderId: string) => {
        socket.join(`order-${orderId}`)
        console.log(`📦 Socket ${socket.id} joined order-${orderId}`)
      })

      // User join room berdasarkan userId
      socket.on('join-user', (userId: string) => {
        socket.join(`user-${userId}`)
        console.log(`👤 Socket ${socket.id} joined user-${userId}`)
      })

      socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id)
      })
    })

    setIO(io)
    console.log('✅ Socket.io server initialized')
  }

  return NextResponse.json({ message: 'Socket.io server ready' })
}