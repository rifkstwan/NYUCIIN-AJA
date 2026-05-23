// lib/notification.ts
import 'dotenv/config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const statusMessages: Record<string, { subject: string; message: string }> = {
  BOOKED: {
    subject: 'Order Berhasil Dibuat',
    message: 'Order kamu telah berhasil dibuat dan sedang menunggu penjemputan.',
  },
  PICKUP: {
    subject: 'Driver Sedang Menuju Lokasi',
    message: 'Driver kami sedang dalam perjalanan untuk menjemput sepatu kamu.',
  },
  WASHING: {
    subject: 'Sepatu Sedang Dicuci',
    message: 'Sepatu kamu sedang dalam proses pencucian.',
  },
  DRYING: {
    subject: 'Sepatu Sedang Dikeringkan',
    message: 'Sepatu kamu sedang dalam proses pengeringan.',
  },
  DELIVERY: {
    subject: 'Sepatu Dalam Pengiriman',
    message: 'Sepatu kamu sudah bersih dan sedang diantar ke alamat kamu.',
  },
  DONE: {
    subject: 'Order Selesai',
    message: 'Sepatu kamu sudah sampai! Jangan lupa berikan ulasan ya.',
  },
  CANCELLED: {
    subject: 'Order Dibatalkan',
    message: 'Order kamu telah dibatalkan. Hubungi kami jika ada pertanyaan.',
  },
}

export async function sendStatusEmail({
  to,
  name,
  orderNumber,
  status,
  note,
}: {
  to: string
  name: string
  orderNumber: string
  status: string
  note?: string
}) {
  const template = statusMessages[status]
  if (!template) return

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a2e; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Cuci Sepatu</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Halo, ${name}!</h2>
        <p style="font-size: 16px;">${template.message}</p>
        ${note ? `<p style="color: #666; font-style: italic;">Catatan: ${note}</p>` : ''}
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6c63ff;">
          <p style="margin: 0;"><strong>No. Order:</strong> ${orderNumber}</p>
          <p style="margin: 8px 0 0;"><strong>Status:</strong> ${status}</p>
        </div>
        <p style="color: #999; font-size: 12px;">
          Jika ada pertanyaan, balas email ini atau hubungi WhatsApp kami.
        </p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `${template.subject} - ${orderNumber}`,
      html,
    })
    console.log(`Email terkirim ke ${to} untuk order ${orderNumber}`)
  } catch (err) {
    console.error('Gagal kirim email:', err)
  }
}

export async function sendWhatsApp({
  phone,
  orderNumber,
  status,
  note,
}: {
  phone: string
  orderNumber: string
  status: string
  note?: string
}) {
  const apiUrl = process.env.WHATSAPP_API_URL
  const apiKey = process.env.WHATSAPP_API_KEY

  if (!apiUrl || !apiKey || !phone) {
    console.log('WhatsApp API tidak dikonfigurasi atau nomor kosong, skip.')
    return
  }

  const template = statusMessages[status]
  if (!template) return

  const message = `Cuci Sepatu - Update Order\n\nNo. Order: ${orderNumber}\nStatus: ${status}\n\n${template.message}${note ? `\n\nCatatan: ${note}` : ''}`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: phone,
        message,
        countryCode: '62',
      }),
    })
    const result = await response.json()
    console.log(`WhatsApp terkirim ke ${phone}:`, result)
  } catch (err) {
    console.error('Gagal kirim WhatsApp:', err)
  }
}