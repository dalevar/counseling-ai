import { PrismaClient, RoleName, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data...');

  // 1. Ensure Roles exist in the database
  const roles = [RoleName.ADMIN, RoleName.STUDENT, RoleName.COUNSELOR, RoleName.TEACHER, RoleName.PARENT];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: {
        name: r,
        description: `${r} role`,
      },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
  const studentRole = await prisma.role.findUnique({ where: { name: RoleName.STUDENT } });

  if (!adminRole || !studentRole) {
    throw new Error('Roles could not be created/found.');
  }

  // 2. Create/Update Admin User
  const adminEmail = 'admin@educouns.ai';
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      roleId: adminRole.id,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });
  console.log(`Admin user created/updated: ${adminUser.email}`);

  // 3. Create/Update Student User
  const studentEmail = 'siswa@educouns.ai';
  const studentPasswordHash = await bcrypt.hash('SiswaPassword123', 10);
  
  const studentUser = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      passwordHash: studentPasswordHash,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      roleId: studentRole.id,
    },
    create: {
      email: studentEmail,
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });

  // Create/Update Student profile
  await prisma.student.upsert({
    where: { id: studentUser.id },
    update: {
      firstName: 'Budi',
      lastName: 'Siswa',
      gender: 'MALE',
      phone: '081234567890',
    },
    create: {
      id: studentUser.id,
      firstName: 'Budi',
      lastName: 'Siswa',
      gender: 'MALE',
      phone: '081234567890',
    },
  });
  console.log(`Student user & profile created/updated: ${studentUser.email}`);

  console.log('Seeding dummy data completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding dummy data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
