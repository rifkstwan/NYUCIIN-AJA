<div align="center">

# 👟 NYUCIIN AJA — Platform Laundry Sepatu Online

> **Full-Stack Web Application** · Next.js 16 · TypeScript · PostgreSQL · Midtrans · Real-time Tracking

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📌 Tentang Proyek

**NYUCIIN AJA** adalah platform manajemen laundry sepatu berbasis web yang dibangun secara *end-to-end* — dari landing page hingga sistem admin dashboard. Proyek ini dirancang untuk membuktikan kemampuan membangun aplikasi production-ready dengan arsitektur yang skalabel, integrasi payment gateway nyata, serta real-time notification system.

> 🎯 Dibangun untuk menjawab kebutuhan bisnis laundry sepatu yang ingin bertransformasi digital.

---

## ✨ Fitur Utama

### 👤 Sisi Pelanggan (Customer)
| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Autentikasi JWT** | Register, Login, Logout dengan cookie-based session |
| 📦 **Pemesanan Online** | Pilih jenis sepatu, jadwal pickup/delivery, dan catat alamat |
| 💳 **Pembayaran Midtrans** | Snap payment dengan berbagai metode (GoPay, VA Bank, QRIS, dll) |
| 📍 **Order Tracking** | Pantau status pesanan secara real-time: Booked → Pickup → Washing → Drying → Delivery → Done |
| 🏆 **Loyalty Points** | Kumpulkan poin setiap transaksi dan tukarkan dengan diskon |
| ⭐ **Review & Rating** | Beri ulasan setelah pesanan selesai |
| 📋 **Riwayat Pesanan** | Lihat semua histori transaksi lengkap |
| 👤 **Profil Pengguna** | Edit profil, ubah password, kelola alamat |

### 🛠️ Sisi Admin (Dashboard)
| Fitur | Deskripsi |
|-------|-----------|
| 📊 **Dashboard Analytics** | Statistik pesanan, revenue, dan pelanggan aktif |
| 📦 **Manajemen Pesanan** | Update status, assign kurir, lihat detail lengkap |
| 💰 **Laporan Revenue** | Filter revenue by periode, export data |
| 👥 **Manajemen User** | Lihat daftar pelanggan dan riwayat mereka |
| 🔔 **Notifikasi Real-time** | Socket.IO untuk update pesanan baru & perubahan status |
| 📸 **Upload Foto Sepatu** | Foto before/after via Cloudinary |
| 🎁 **Manajemen Promo** | Tambah/edit promo dengan badge dan periode aktif |
| 💬 **Kelola Testimoni** | Moderasi review dari pelanggan |
| 📤 **Export Data** | Export laporan ke format CSV/Excel |

---

## 🏗️ Arsitektur & Tech Stack

```
NYUCIIN AJA
├── Frontend          → Next.js 16 (App Router) + Tailwind CSS v4 + Framer Motion
├── Backend           → Next.js API Routes (REST API)
├── Database          → PostgreSQL + Prisma ORM
├── Auth              → JWT + bcryptjs (Cookie-based)
├── Payment           → Midtrans Snap (Webhook Integration)
├── Real-time         → Socket.IO
├── File Storage      → Cloudinary
├── Email             → Nodemailer
└── UI Components     → shadcn/ui + Radix UI
```

### 🗄️ Database Schema (Simplified)

```
User ──┬── Order ──┬── Payment        (Midtrans)
       │           ├── OrderTracking  (Status history)
       │           ├── ShoePhoto      (Cloudinary URLs)
       │           ├── Review
       │           ├── PickupSchedule
       │           └── LoyaltyPoint
       │
       └── LoyaltyPoint
```

Models: `User`, `ShoeType`, `Order`, `OrderTracking`, `Payment`, `LoyaltyPoint`, `ShoePhoto`, `Review`, `PickupSchedule`, `Notification`, `Promo`

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Registrasi pelanggan |
| `POST` | `/api/auth/login` | Login & set JWT cookie |
| `GET`  | `/api/orders` | Daftar pesanan user |
| `POST` | `/api/orders` | Buat pesanan baru |
| `GET`  | `/api/orders/:id/tracking` | Tracking status pesanan |
| `POST` | `/api/payments` | Inisiasi Midtrans Snap Token |
| `POST` | `/api/payments/webhook` | Midtrans payment webhook |
| `GET`  | `/api/loyalty` | Saldo & riwayat poin |
| `GET`  | `/api/reviews` | Testimoni publik |
| `POST` | `/api/upload` | Upload foto ke Cloudinary |
| `GET`  | `/api/admin/dashboard` | Statistik dashboard admin |
| `PUT`  | `/api/admin/orders/:id` | Update status pesanan |
| `GET`  | `/api/admin/revenue` | Laporan pendapatan |
| `GET`  | `/api/promos` | Daftar promo aktif |

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Akun [Midtrans Sandbox](https://sandbox.midtrans.com/)
- Akun [Cloudinary](https://cloudinary.com/)

### 1. Clone & Install

```bash
git clone https://github.com/username/nyuciin-aja.git
cd nyuciin-aja
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nyuciin_aja"

# JWT
JWT_SECRET="your-super-secret-key"

# Midtrans
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Nodemailer (opsional)
MAIL_HOST="smtp.gmail.com"
MAIL_USER="your@email.com"
MAIL_PASS="your-app-password"
```

### 3. Setup Database

```bash
# Jalankan migration
npx prisma migrate dev

# Seed data awal (opsional)
npm run seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

> Untuk Socket.IO proxy, jalankan `npx ts-node proxy.ts` di terminal terpisah.

---

## 📁 Struktur Proyek

```
nyuciin-aja/
├── app/
│   ├── auth/                # Login & Register
│   ├── dashboard/           # Area pelanggan (protected)
│   │   ├── pesan/           # Form pemesanan
│   │   ├── orders/          # Daftar pesanan
│   │   ├── tracking/        # Tracking real-time
│   │   ├── riwayat/         # Histori transaksi
│   │   ├── loyalty/         # Poin reward
│   │   └── profil/          # Pengaturan akun
│   ├── admin/               # Area admin (protected + role check)
│   │   ├── orders/          # Manajemen pesanan
│   │   ├── users/           # Manajemen user
│   │   ├── revenue/         # Laporan keuangan
│   │   ├── testimonials/    # Moderasi review
│   │   ├── notifications/   # Notifikasi
│   │   └── export/          # Export data
│   └── api/                 # REST API Routes (Next.js Route Handlers)
│       ├── auth/
│       ├── orders/
│       ├── payments/
│       ├── loyalty/
│       ├── upload/
│       ├── reviews/
│       ├── promos/
│       └── admin/
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── landing/             # Komponen halaman utama
│   ├── admin/               # Komponen dashboard admin
│   └── PayButton.tsx        # Midtrans Snap integration
├── lib/                     # Utilities & helpers
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Data awal
└── proxy.ts                 # Socket.IO proxy server
```

---

## 🧠 Highlights Teknis

- **App Router Next.js 16** — Menggunakan Server Components dan Route Handlers untuk performa optimal
- **JWT Cookie-based Auth** — Aman tanpa localStorage, dengan middleware proteksi route
- **Midtrans Webhook** — Penanganan pembayaran asinkron dengan verifikasi signature
- **Real-time Socket.IO** — Admin mendapat notifikasi instan setiap ada pesanan masuk atau perubahan status
- **Cloudinary Integration** — Upload & transformasi gambar before/after sepatu
- **Prisma ORM** — Type-safe database queries dengan migration system
- **Framer Motion** — Animasi UI yang smooth di sisi pelanggan
- **shadcn/ui + Radix UI** — Komponen aksesibel dan konsisten
- **Loyalty System** — Gamifikasi transaksi untuk meningkatkan retensi pelanggan
- **Role-based Access Control** — Pemisahan akses User vs Admin

---

## 👨‍💻 Developer

> Proyek ini dibuat sebagai bukti kemampuan membangun *full-stack web application* skala produksi — dari desain database, REST API, autentikasi, payment gateway, hingga UI/UX pelanggan dan admin panel.

---

## 📜 Lisensi

Proyek ini bersifat open-source untuk keperluan portofolio. Silakan digunakan sebagai referensi belajar.

---

<div align="center">

**Made with ❤️ using Next.js, TypeScript & PostgreSQL**

</div>
