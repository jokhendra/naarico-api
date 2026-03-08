# Multi-Tenancy Implementation Plan

## Overview

Convert the current single-tenant backend into a multi-tenant marketplace where multiple sellers can manage their own products, orders, and stores with complete data isolation.

## Database Schema Changes

### 1. Create Store Model

**File:** `e-commerce-api/prisma/schema.prisma`

Add new Store model after the Brand model:

```prisma
model Store {
  id              String       @id @default(uuid())
  name            String
  slug            String       @unique
  description     String?
  logo            String?
  sellerId        String       @map("seller_id")
  status          StoreStatus  @default(PENDING)
  isOnVacation    Boolean      @default(false) @map("is_on_vacation")
  vacationMessage String?      @map("vacation_message")
  commissionRate  Decimal      @default(15) @db.Decimal(5, 2)
  isActive        Boolean      @default(true) @map("is_active")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")
  
  // Relations
  seller          User         @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  products        Product[]
  orders          Order[]
  
  @@index([sellerId])
  @@index([status])
  @@index([slug])
  @@index([isOnVacation])
  @@map("stores")
}

enum StoreStatus {
  PENDING
  APPROVED
  SUSPENDED
  CLOSED
}
```

### 2. Update Product Model

**File:** `e-commerce-api/prisma/schema.prisma`

Modify Product model to make sellerId required and add storeId:

```prisma
model Product {
  // Change sellerId from optional to required
  sellerId              String                  @map("seller_id")  // Remove the ?
  
  // Make storeId required - every product must belong to a store
  storeId               String                  @map("store_id")  // Required!
  store                 Store                   @relation(fields: [storeId], references: [id])
  
  // Add index for storeId
  @@index([storeId], map: "idx_product_store")
}
```

### 3. Update User Model

**File:** `e-commerce-api/prisma/schema.prisma`

Add Store relation to User model:

```prisma
model User {
  // Existing fields...
  stores          Store[]  // Add this line
}
```

### 4. Update Order Model

**File:** `e-commerce-api/prisma/schema.prisma`

Add store relationship to Order:

```prisma
model Order {
  // Existing fields...
  storeId         String?   @map("store_id")
  store           Store?    @relation(fields: [storeId], references: [id])
  
  @@index([storeId])
}
```

### 5. Run Migration

```bash
npx prisma migrate dev --name add_multi_tenancy_support
npx prisma generate
```

## Core Multi-Tenancy Infrastructure

### 6. Create Seller Context Decorator (BACKWARD COMPATIBLE)

**File:** `e-commerce-api/src/common/decorators/seller-context.decorator.ts` (NEW)

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface SellerContext {
  sellerId: string | null;
  storeId: string | null;
  isAdmin: boolean;
  isSeller: boolean;
  isAuthenticated: boolean;
}

export const GetSellerContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SellerContext => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Handle public routes (no authentication)
    if (!user) {
      return {
        sellerId: null,
        storeId: null,
        isAdmin: false,
        isSeller: false,
        isAuthenticated: false,
      };
    }

    return {
      sellerId: user.role === 'SELLER' ? user.id : null,
      storeId: user.storeId || null,
      isAdmin: user.role === 'ADMIN',
      isSeller: user.role === 'SELLER',
      isAuthenticated: true,
    };
  },
);
```

### 7. Create Ownership Guard

**File:** `e-commerce-api/src/common/guards/ownership.guard.ts` (NEW)

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id || request.params.productId;
    const resourceType = this.reflector.get<string>('resourceType', context.getHandler());

    // Admins bypass ownership checks
    if (user.role === Role.ADMIN) return true;

    // For sellers, verify ownership
    if (user.role === Role.SELLER && resourceType === 'product') {
      const product = await this.prisma.product.findUnique({
        where: { id: resourceId },
        select: { sellerId: true },
      });

      if (!product || product.sellerId !== user.id) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
    }

    return true;
  }
}
```

### 8. Create Resource Type Decorator

**File:** `e-commerce-api/src/common/decorators/resource-type.decorator.ts` (NEW)

```typescript
import { SetMetadata } from '@nestjs/common';

export const ResourceType = (type: string) => SetMetadata('resourceType', type);
```

## Service Layer Updates

### 9. Update ProductsService - Add Tenant Filtering

**File:** `e-commerce-api/src/modules/products/products.service.ts`

Update the `findAll` method (around line 41):

```typescript
async findAll(
  filterDto: ProductFilterDto,
  sellerContext?: { sellerId: string | null; isAdmin: boolean },
): Promise<PaginatedProductResponseDto> {
  // ... existing code ...
  
  const where: Prisma.ProductWhereInput = {};
  where.isActive = true;

  // TENANT ISOLATION: Filter by seller if not admin
  if (sellerContext?.sellerId && !sellerContext.isAdmin) {
    where.sellerId = sellerContext.sellerId;
  }

  // Only show products from approved stores (for public API)
  if (!sellerContext) {
    where.store = {
      status: 'APPROVED',
    };
  }

  // ... rest of existing filters ...
}
```

Update the `create` method to auto-assign sellerId:

```typescript
async create(
  createProductDto: CreateProductDto,
  sellerId: string,
): Promise<ProductResponseDto> {
  // Auto-assign sellerId
  const productData = {
    ...createProductDto,
    sellerId, // Automatically set from context
  };

  // ... rest of creation logic ...
}
```

Add ownership check to `update` and `delete` methods:

```typescript
async update(
  id: string,
  updateProductDto: UpdateProductDto,
  sellerContext: { sellerId: string | null; isAdmin: boolean },
): Promise<ProductResponseDto> {
  // Verify ownership if not admin
  if (!sellerContext.isAdmin) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!product || product.sellerId !== sellerContext.sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }
  }

  // ... rest of update logic ...
}
```

### 10. Update ProductsController

**File:** `e-commerce-api/src/modules/products/products.controller.ts`

Update the `findAll` method (around line 36):

```typescript
@Get()
async findAll(
  @Query() filterDto: ProductFilterDto,
  @GetSellerContext() sellerContext: SellerContext,
) {
  return this.productsService.findAll(filterDto, sellerContext);
}
```

Update the `create` method (around line 299):

```typescript
@Post()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SELLER) // Allow both ADMIN and SELLER
async create(
  @Body() createProductDto: CreateProductDto,
  @GetSellerContext() sellerContext: SellerContext,
) {
  const sellerId = sellerContext.isAdmin 
    ? createProductDto.sellerId // Admin can specify
    : sellerContext.sellerId;   // Seller auto-assigned

  return this.productsService.create(createProductDto, sellerId);
}
```

Update `update` method (around line 320):

```typescript
@Patch(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard, OwnershipGuard)
@Roles(Role.ADMIN, Role.SELLER)
@ResourceType('product')
async update(
  @Param('id') id: string,
  @Body() updateProductDto: UpdateProductDto,
  @GetSellerContext() sellerContext: SellerContext,
) {
  return this.productsService.update(id, updateProductDto, sellerContext);
}
```

Update `delete` method (around line 349):

```typescript
@Delete(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard, OwnershipGuard)
@Roles(Role.ADMIN, Role.SELLER)
@ResourceType('product')
async remove(
  @Param('id') id: string,
  @GetSellerContext() sellerContext: SellerContext,
) {
  return this.productsService.remove(id, sellerContext);
}
```

## Store Management Module

### 11. Create Store DTOs

**File:** `e-commerce-api/src/modules/stores/dto/create-store.dto.ts` (NEW)

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;
}
```

**File:** `e-commerce-api/src/modules/stores/dto/update-store.dto.ts` (NEW)

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
```

**File:** `e-commerce-api/src/modules/stores/dto/update-store-status.dto.ts` (NEW)

```typescript
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StoreStatus } from '@prisma/client';

export class UpdateStoreStatusDto {
  @ApiProperty({ enum: StoreStatus })
  @IsEnum(StoreStatus)
  status: StoreStatus;
}
```

**File:** `e-commerce-api/src/modules/stores/dto/toggle-vacation.dto.ts` (NEW)

```typescript
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleVacationDto {
  @ApiProperty({ description: 'Enable or disable vacation mode' })
  @IsBoolean()
  isOnVacation: boolean;

  @ApiProperty({ required: false, description: 'Message to display during vacation' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vacationMessage?: string;
}
```

### 12. Create StoresService

**File:** `e-commerce-api/src/modules/stores/stores.service.ts` (NEW)

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreStatusDto } from './dto/update-store-status.dto';
import { ToggleVacationDto } from './dto/toggle-vacation.dto';
import slugify from '../../common/utils/slugify';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(createStoreDto: CreateStoreDto, sellerId: string) {
    const slug = slugify(createStoreDto.name);

    return this.prisma.store.create({
      data: {
        ...createStoreDto,
        slug,
        sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(sellerId?: string) {
    return this.prisma.store.findMany({
      where: sellerId ? { sellerId } : undefined,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto, sellerId: string, isAdmin: boolean) {
    const store = await this.findOne(id);

    if (!isAdmin && store.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own store');
    }

    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateStoreStatusDto) {
    return this.prisma.store.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async toggleVacation(id: string, toggleVacationDto: ToggleVacationDto, sellerId: string, isAdmin: boolean) {
    const store = await this.findOne(id);

    if (!isAdmin && store.sellerId !== sellerId) {
      throw new ForbiddenException('You can only manage your own store vacation mode');
    }

    return this.prisma.store.update({
      where: { id },
      data: {
        isOnVacation: toggleVacationDto.isOnVacation,
        vacationMessage: toggleVacationDto.vacationMessage,
      },
    });
  }

  async remove(id: string, sellerId: string, isAdmin: boolean) {
    const store = await this.findOne(id);

    if (!isAdmin && store.sellerId !== sellerId) {
      throw new ForbiddenException('You can only delete your own store');
    }

    return this.prisma.store.delete({
      where: { id },
    });
  }
}
```

### 13. Create StoresController

**File:** `e-commerce-api/src/modules/stores/stores.controller.ts` (NEW)

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreStatusDto } from './dto/update-store-status.dto';
import { ToggleVacationDto } from './dto/toggle-vacation.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetSellerContext } from '../../common/decorators/seller-context.decorator';
import { SellerContext } from '../../common/decorators/seller-context.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new store (Seller only)' })
  create(
    @Body() createStoreDto: CreateStoreDto,
    @GetSellerContext() context: SellerContext,
  ) {
    return this.storesService.create(createStoreDto, context.sellerId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all stores' })
  findAll(@GetSellerContext() context: SellerContext) {
    const sellerId = context.isAdmin ? undefined : context.sellerId;
    return this.storesService.findAll(sellerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store by ID' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store' })
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @GetSellerContext() context: SellerContext,
  ) {
    return this.storesService.update(id, updateStoreDto, context.sellerId, context.isAdmin);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store status (Admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStoreStatusDto,
  ) {
    return this.storesService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/vacation')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle vacation mode (Seller can manage their own)' })
  toggleVacation(
    @Param('id') id: string,
    @Body() toggleVacationDto: ToggleVacationDto,
    @GetSellerContext() context: SellerContext,
  ) {
    return this.storesService.toggleVacation(id, toggleVacationDto, context.sellerId, context.isAdmin);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete store' })
  remove(
    @Param('id') id: string,
    @GetSellerContext() context: SellerContext,
  ) {
    return this.storesService.remove(id, context.sellerId, context.isAdmin);
  }
}
```

### 14. Create StoresModule

**File:** `e-commerce-api/src/modules/stores/stores.module.ts` (NEW)

```typescript
import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { PrismaService } from '../../common/prisma.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [StoresController],
  providers: [StoresService, PrismaService],
  exports: [StoresService],
})
export class StoresModule {}
```

### 15. Register StoresModule in AppModule

**File:** `e-commerce-api/src/app.module.ts`

Add StoresModule to imports array:

```typescript
import { StoresModule } from './modules/stores/stores.module';

@Module({
  imports: [
    // ... existing imports
    StoresModule,
  ],
})
```

## Additional Service Updates

### 16. Update OrdersService for Multi-Tenancy

**File:** `e-commerce-api/src/modules/orders/orders.service.ts`

Add seller filtering to findAll method and auto-assign storeId when creating orders based on product's store.

### 17. Update SearchService

**File:** `e-commerce-api/src/modules/search/services/product-search.service.ts`

Add store status filtering to only show products from approved stores and not on vacation in search results:

```typescript
// Filter products
where: {
  isActive: true,
  store: {
    status: 'APPROVED',
    isOnVacation: false,  // Don't show vacation stores
  }
}
```

## Testing & Documentation

### 18. Create Migration Seeder for Test Data

**File:** `e-commerce-api/prisma/seeder/store.seeder.ts` (NEW)

Create test stores and assign products to sellers for development/testing.

### 19. Update API Documentation

**File:** `e-commerce-api/docs/MULTI_TENANCY_GUIDE.md` (NEW)

Document the multi-tenancy architecture, seller workflows, and API endpoints.

## Key Features

### Vacation Mode
- Sellers can toggle vacation mode for their store
- Products from vacation stores are hidden from public search
- Sellers can set a vacation message
- Independent from admin-controlled status

### Control Hierarchy
- **Admin Controls:** Store status (PENDING/APPROVED/SUSPENDED/CLOSED)
- **Seller Controls:** Vacation mode, store details (name, description, logo)
- **Both Control:** Product management (with ownership validation)

## Summary

This plan implements complete multi-tenancy with:

- Store lifecycle management (PENDING → APPROVED → SUSPENDED → CLOSED)
- Vacation mode for seller self-service
- Complete data isolation between sellers
- Ownership validation for all CRUD operations
- Seller-specific product management
- Admin controls for store approval and management
- Backward compatibility with existing ADMIN role
- Required storeId for all products (strict hierarchy: Admin → Seller → Store → Product)

