// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Get the SUPER_ADMIN role id
  const superAdminRole = await prisma.role.findUnique({
    where: {
      name: 'SUPER_ADMIN'
    }
  })

  const AdminRole = await prisma.role.findUnique({
    where: {
      name: 'ADMIN'
    }
  })

  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN role not found')
  } else if (!AdminRole) {
    throw new Error('ADMIN role not found')

  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('test123', 10)

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@test.com',
      username: 'brj',
      password: hashedPassword,
      roleId: AdminRole.id
    }
  })

  console.log({ testUser })
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