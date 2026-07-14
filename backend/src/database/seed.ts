import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database roles and permissions...');

  const roles = [
    {
      name: RoleName.ADMIN,
      description: 'System Administrator with full access',
    },
    {
      name: RoleName.STUDENT,
      description: 'Student user who can access counseling, assessments, and mood tracking',
    },
    {
      name: RoleName.COUNSELOR,
      description: 'Professional Counselor handling sessions and providing notes',
    },
    {
      name: RoleName.TEACHER,
      description: 'BK Teacher monitoring student progress and sessions',
    },
    {
      name: RoleName.PARENT,
      description: "Parent user monitoring their child's progress",
    },
  ];

  for (const role of roles) {
    const existing = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existing) {
      await prisma.role.create({
        data: {
          name: role.name,
          description: role.description,
        },
      });
      console.log(`Role ${role.name} created.`);
    } else {
      console.log(`Role ${role.name} already exists.`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
