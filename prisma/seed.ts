// prisma/seed.ts
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.shoeType.createMany({
    data: [
      { name: 'Sneakers', basePrice: 25000, description: 'Sepatu olahraga & kasual' },
      { name: 'Boots', basePrice: 35000, description: 'Sepatu boot kulit & suede' },
      { name: 'Heels', basePrice: 30000, description: 'Sepatu hak tinggi' },
      { name: 'Sandal', basePrice: 15000, description: 'Sandal & flat shoes' },
      { name: 'Sepatu Anak', basePrice: 20000, description: 'Semua jenis sepatu anak' },
      { name: 'Sepatu Kulit', basePrice: 40000, description: 'Sepatu formal kulit asli' },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Seed shoe types berhasil!')
}

main().catch(console.error).finally(() => prisma.$disconnect())