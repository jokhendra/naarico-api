import { PrismaClient, Role, UserStatus, StoreStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SellerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  stores: {
    name: string;
    description: string;
    status: StoreStatus;
    isOnVacation?: boolean;
    vacationMessage?: string;
    commissionRate?: number;
  }[];
}

// Predefined seller data with their stores
const SELLERS_DATA: SellerData[] = [
  {
    email: 'seller1@nothing.com',
    password: 'Nothing@1234',
    firstName: 'Nothing',
    lastName: 'Electronics',
    phone: '+1234567890',
    stores: [
      {
        name: 'Electronics Hub',
        description: 'Your one-stop shop for all electronics and gadgets. We offer the latest smartphones, laptops, and accessories.',
        status: StoreStatus.APPROVED,
        commissionRate: 12,
      },
      {
        name: 'Tech Accessories Store',
        description: 'Premium accessories for your devices. Cases, chargers, and more.',
        status: StoreStatus.APPROVED,
        commissionRate: 15,
      },
    ],
  },
  {
    email: 'seller2@nothing.com',
    password: 'Nothing@1234',
    firstName: 'Nothing',
    lastName: 'Fashion',
    phone: '+1234567891',
    stores: [
      {
        name: 'Fashion Paradise',
        description: 'Trendy clothing and accessories for men and women. Stay stylish with our curated collection.',
        status: StoreStatus.APPROVED,
        commissionRate: 18,
      },
    ],
  },
  {
    email: 'seller3@nothing.com',
    password: 'Nothing@1234',
    firstName: 'Nothing',
    lastName: 'Books',
    phone: '+1234567892',
    stores: [
      {
        name: 'Book Haven',
        description: 'A paradise for book lovers. Fiction, non-fiction, educational books and more.',
        status: StoreStatus.APPROVED,
        commissionRate: 10,
      },
    ],
  },
  {
    email: 'seller4@nothing.com',
    password: 'Nothing@1234',
    firstName: 'Nothing',
    lastName: 'Home',
    phone: '+1234567893',
    stores: [
      {
        name: 'Home Essentials',
        description: 'Everything you need for your home. Furniture, decor, kitchen items and more.',
        status: StoreStatus.APPROVED,
        commissionRate: 15,
      },
    ],
  },
  {
    email: 'seller5@nothing.com',
    password: 'Nothing@1234',
    firstName: 'Nothing',
    lastName: 'Sports',
    phone: '+1234567894',
    stores: [
      {
        name: 'Sports Arena',
        description: 'Professional sports equipment and fitness gear. Get fit with quality products.',
        status: StoreStatus.APPROVED,
        commissionRate: 14,
      },
    ],
  },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createSeller(sellerData: SellerData) {
  const hashedPassword = await bcrypt.hash(sellerData.password, 12);

  // Check if seller already exists
  const existingSeller = await prisma.user.findUnique({
    where: { email: sellerData.email },
  });

  let seller;
  if (existingSeller) {
    console.log(`Seller ${sellerData.email} already exists, skipping...`);
    seller = existingSeller;
  } else {
    seller = await prisma.user.create({
      data: {
        email: sellerData.email,
        password: hashedPassword,
        firstName: sellerData.firstName,
        lastName: sellerData.lastName,
        phone: sellerData.phone,
        isEmailVerified: true,
        isPhoneVerified: !!sellerData.phone,
        status: UserStatus.ACTIVE,
        role: Role.SELLER,
      },
    });
    console.log(`✅ Created seller: ${sellerData.email}`);
  }

  // Create stores for this seller
  for (const storeData of sellerData.stores) {
    const slug = generateSlug(storeData.name);

    // Check if store already exists
    const existingStore = await prisma.store.findUnique({
      where: { slug },
    });

    if (existingStore) {
      console.log(`   Store "${storeData.name}" already exists, skipping...`);
      continue;
    }

    const store = await prisma.store.create({
      data: {
        name: storeData.name,
        slug,
        description: storeData.description,
        sellerId: seller.id,
        status: storeData.status,
        isOnVacation: storeData.isOnVacation || false,
        vacationMessage: storeData.vacationMessage,
        commissionRate: storeData.commissionRate || 15,
        isActive: true,
      },
    });

    console.log(`   ✅ Created store: ${storeData.name} (${storeData.status})`);
  }

  return seller;
}

export async function seedSellers(prismaClient: PrismaClient = prisma): Promise<void> {
  console.log('\n🏪 Starting seller and store seeding...\n');

  try {
    for (const sellerData of SELLERS_DATA) {
      await createSeller(sellerData);
    }

    // Summary
    const totalSellers = await prisma.user.count({
      where: { role: Role.SELLER },
    });

    const totalStores = await prisma.store.count();
    const approvedStores = await prisma.store.count({
      where: { status: StoreStatus.APPROVED },
    });
    const pendingStores = await prisma.store.count({
      where: { status: StoreStatus.PENDING },
    });
    const vacationStores = await prisma.store.count({
      where: { isOnVacation: true },
    });

    console.log('\n📊 Seeding Summary:');
    console.log(`   Total Sellers: ${totalSellers}`);
    console.log(`   Total Stores: ${totalStores}`);
    console.log(`   - Approved: ${approvedStores}`);
    console.log(`   - Pending: ${pendingStores}`);
    console.log(`   - On Vacation: ${vacationStores}`);
    console.log('\n✅ Seller and store seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding sellers and stores:', error);
    throw error;
  }
}

// Allow running this seeder independently
if (require.main === module) {
  seedSellers()
    .then(() => {
      console.log('Seller seeding completed.');
      process.exitCode = 0;
    })
    .catch((error) => {
      console.error('Seller seeding failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

