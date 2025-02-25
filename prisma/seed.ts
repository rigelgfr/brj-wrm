// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // First, create the roles if they don't exist
  // Using the ID field name from your schema, which is 'role'
  try {
    const superAdminRole = await prisma.role.upsert({
      where: { role: 'SUPER_ADMIN' },
      update: {},
      create: { role: 'SUPER_ADMIN' }
    })

    const adminRole = await prisma.role.upsert({
      where: { role: 'ADMIN' },
      update: {},
      create: { role: 'ADMIN' }
    })

    // Hash the password
    const hashedPassword = await bcrypt.hash('12345', 10)

    // Create a test user with connected role
    const testUser = await prisma.user.upsert({
      where: { email: 'admin@wrm.com' },
      update: {},
      create: {
        email: 'admin@wrm.com',
        username: 'admin',
        password: hashedPassword,
        role: superAdminRole.role
      }
    })

    console.log({ testUser })
  } catch (error) {
    console.error("Detailed error:", error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });