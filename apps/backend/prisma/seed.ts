import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Prisma seed foundation: Initializing baseline system configuration...');

  await prisma.systemHealth.upsert({
    where: { key: 'SYSTEM_STATUS' },
    update: { value: 'INITIALIZED' },
    create: {
      key: 'SYSTEM_STATUS',
      value: 'INITIALIZED',
    },
  });

  console.log('Prisma seed foundation complete.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
