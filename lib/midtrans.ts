// lib/midtrans.ts
import 'dotenv/config'
const midtransClient = require('midtrans-client')

const serverKey = process.env.MIDTRANS_SERVER_KEY
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'

console.log('🔑 Midtrans Server Key:', serverKey?.substring(0, 20) + '...')
console.log('🌍 Is Production:', isProduction)

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})