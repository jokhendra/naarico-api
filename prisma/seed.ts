import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seeder/admin.seeder';
import { seedBrands } from './seeder/brand.seeder';
import { seedCategories } from './seeder/category.seeder';
import { seedSellers } from './seeder/seller.seeder';
import { seedProducts } from './seeder/product.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Starting database seed...\n');

  await seedAdmin(prisma);
  await seedBrands(prisma);
  await seedCategories(prisma);
  await seedSellers(prisma);
  await seedProducts(prisma);

  console.log('\n✅ Database seed completed successfully.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
