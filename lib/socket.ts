// lib/socket.ts
import { Server as SocketIOServer } from 'socket.io'

declare global {
  var io: SocketIOServer | undefined
}

export function getIO(): SocketIOServer | null {
  return global.io ?? null
}

export function setIO(io: SocketIOServer) {
  global.io = io
}