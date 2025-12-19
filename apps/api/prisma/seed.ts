import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tukki.com' },
    update: {},
    create: {
      email: 'admin@tukki.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Created Super Admin:', admin.email);

  // Create Test Organizer
  const organizerPassword = await bcrypt.hash('organizer123', 10);

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@tukki.com' },
    update: {},
    create: {
      email: 'organizer@tukki.com',
      password: organizerPassword,
      firstName: 'Test',
      lastName: 'Organizer',
      role: 'ORGANIZER',
      emailVerified: true,
    },
  });

  console.log('✅ Created Test Organizer:', organizer.email);

  // Create Test User
  const userPassword = await bcrypt.hash('user123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@tukki.com' },
    update: {},
    create: {
      email: 'user@tukki.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      emailVerified: true,
    },
  });

  console.log('✅ Created Test User:', user.email);

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('Super Admin: admin@tukki.com / admin123');
  console.log('Organizer: organizer@tukki.com / organizer123');
  console.log('User: user@tukki.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
