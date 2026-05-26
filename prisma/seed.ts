import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Hapus semua data lama
  await prisma.shoeType.deleteMany()

  // Insert data baru
  await prisma.shoeType.createMany({
    data: [
      { name: 'Fast Cleaning', basePrice: 20000, description: 'Pencucian instan pada bagian upper dan midsole', isActive: true },
      { name: 'Deep Cleaning', basePrice: 25000, description: 'Perawatan pembersihan pada seluruh permukaan (Upper, Midsole, Outsole & Insole)', isActive: true },
      { name: 'Unyellowing', basePrice: 35000, description: 'Perawatan pada bagian midsole yang telah menguning untuk menghilangkan warna kuning tanpa repaint', isActive: true },
    ],
  })
  console.log('✅ ShoeType seeded!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
