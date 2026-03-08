# Database Seeders

This directory contains seeders for populating the database with initial and test data for the multi-tenant e-commerce platform.

## Available Seeders

### 1. **Admin Seeder** (`admin.seeder.ts`)
Creates the system admin user.

**Default Credentials:**
- Email: `admin@allmart.fashion`
- Password: `@Hasan1010`

**Run individually:**
```bash
npx ts-node prisma/seeder/admin.seeder.ts
```

### 2. **Brand Seeder** (`brand.seeder.ts`)
Creates various product brands.

**Run individually:**
```bash
npx ts-node prisma/seeder/brand.seeder.ts
```

### 3. **Category Seeder** (`category.seeder.ts`)
Creates product categories with hierarchical structure.

**Run individually:**
```bash
npx ts-node prisma/seeder/category.seeder.ts
```

### 4. **Seller & Store Seeder** (`seller.seeder.ts`) ⭐ NEW
Creates multiple test sellers and their stores with various statuses.

**Seeded Sellers:**

| Email | Password | Store Name | Status | Description |
|-------|----------|------------|--------|-------------|
| `seller1@allmart.com` | `Seller@1234` | Electronics Hub | ✅ APPROVED | Electronics and gadgets |
| `seller1@allmart.com` | `Seller@1234` | Tech Accessories Store | ✅ APPROVED | Device accessories |
| `seller2@allmart.com` | `Seller@1234` | Fashion Paradise | ✅ APPROVED | Clothing and fashion |
| `seller3@allmart.com` | `Seller@1234` | Book Haven | ✅ APPROVED | Books and literature |
| `seller4@allmart.com` | `Seller@1234` | Home Essentials | ✅ APPROVED | Home and furniture |
| `seller5@allmart.com` | `Seller@1234` | Sports Arena | ✅ APPROVED | Sports equipment |
| `newreseller@allmart.com` | `Seller@1234` | New Store Pending | ⏳ PENDING | Awaiting approval |
| `vacationreseller@allmart.com` | `Seller@1234` | Vacation Store | 🏖️ ON VACATION | Currently on vacation |

**Run individually:**
```bash
npx ts-node prisma/seeder/seller.seeder.ts
```

### 5. **Product Seeder** (`product.seeder.ts`)
Creates products with images, variants, specifications, and deals.

**Run individually:**
```bash
npx ts-node prisma/seeder/product.seeder.ts
```

## Running All Seeders

### Option 1: Using Prisma Seed Command (Recommended)
This runs all seeders in the correct order:

```bash
npx prisma db seed
```

Or if you've reset the database:

```bash
npx prisma migrate reset
# This will reset the database and automatically run the seed
```

### Option 2: Using Individual Seeders
Run seeders in this order:

```bash
# 1. Admin (required first)
npx ts-node prisma/seeder/admin.seeder.ts

# 2. Brands
npx ts-node prisma/seeder/brand.seeder.ts

# 3. Categories
npx ts-node prisma/seeder/category.seeder.ts

# 4. Sellers and Stores
npx ts-node prisma/seeder/seller.seeder.ts

# 5. Products (requires all above)
npx ts-node prisma/seeder/product.seeder.ts
```

## Seeding Order (Important!)

The seeders must be run in this order due to dependencies:

```
1. Admin         (independent)
2. Brands        (independent)
3. Categories    (independent)
4. Sellers       (independent)
   ↓
5. Products      (depends on: Admin, Brands, Categories, Sellers, Stores)
```

## Testing Different Scenarios

### Test APPROVED Stores
Login as any of these sellers to manage approved stores:
- `seller1@allmart.com` - Has 2 stores
- `seller2@allmart.com` - Fashion store
- `seller3@allmart.com` - Book store
- `seller4@allmart.com` - Home store
- `seller5@allmart.com` - Sports store

### Test PENDING Store Approval
Login as:
- `newreseller@allmart.com` - Store awaiting admin approval

### Test Vacation Mode
Login as:
- `vacationreseller@allmart.com` - Store on vacation (products hidden from search)

## Customizing Seed Data

### Adding More Sellers

Edit `seller.seeder.ts` and add to the `SELLERS_DATA` array:

```typescript
{
  email: 'yourreseller@allmart.com',
  password: 'Seller@1234',
  firstName: 'Your',
  lastName: 'Name',
  phone: '+1234567890',
  stores: [
    {
      name: 'Your Store Name',
      description: 'Your store description',
      status: StoreStatus.APPROVED,
      commissionRate: 15,
    },
  ],
}
```

### Modifying Store Status

Change the `status` field in `SELLERS_DATA`:
- `StoreStatus.PENDING` - Awaiting approval
- `StoreStatus.APPROVED` - Active and selling
- `StoreStatus.SUSPENDED` - Temporarily blocked
- `StoreStatus.CLOSED` - Permanently closed

### Setting Vacation Mode

Add to the store object:
```typescript
{
  name: 'Store Name',
  status: StoreStatus.APPROVED,
  isOnVacation: true,
  vacationMessage: 'We will be back on January 15th!',
}
```

## Environment Variables

Seeders use environment variables from `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
ADMIN_EMAIL="admin@allmart.fashion"        # Optional
ADMIN_PASSWORD="@Hasan1010"                # Optional
ADMIN_FIRST_NAME="Admin"                   # Optional
ADMIN_LAST_NAME="User"                     # Optional
```

## Verifying Seeded Data

### Check in Database
```bash
# Connect to your database
psql -d your_database

# Check counts
SELECT role, COUNT(*) FROM users GROUP BY role;
SELECT status, COUNT(*) FROM stores GROUP BY status;
SELECT COUNT(*) FROM products;
```

### Check in Application
1. Start the app: `npm run start:dev`
2. Visit: `http://localhost:3000/api` (Swagger docs)
3. Login as admin or seller
4. Test the endpoints

## Troubleshooting

### "No admin user found"
Run the admin seeder first:
```bash
npx ts-node prisma/seeder/admin.seeder.ts
```

### "Brands or categories missing"
Run seeders in correct order. Brands and categories must be seeded before products.

### "Store already exists"
The seeders check for existing data and skip duplicates. This is normal and safe.

### Reset Everything
```bash
npx prisma migrate reset
# This will drop all data, rerun migrations, and reseed
```

## Production Considerations

⚠️ **Important:** These seeders are for **development and testing only**.

For production:
1. **DO NOT** use default passwords
2. **DO NOT** seed test sellers/stores
3. Only seed essential data (admin, initial categories, brands)
4. Use strong, unique passwords
5. Consider creating a separate `production.seeder.ts`

## Support

For issues or questions about seeders:
1. Check this README
2. Review seeder code in `prisma/seeder/`
3. Check main seed orchestrator: `prisma/seed.ts`

