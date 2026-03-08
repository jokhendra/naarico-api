# Seller Registration System Implementation Plan

## Overview

This document provides a comprehensive implementation plan for a self-service seller registration system. The system allows users to apply to become sellers, enables admin review and approval, and automatically upgrades user roles with store creation upon approval.

**Architecture:** Two-table design (User + SellerApplication) maintaining single authentication source.

---

## Implementation Checklist

### Phase 1: Database Schema

- [ ] **Add SellerApplication Model to Prisma Schema**
  - File: `e-commerce-api/prisma/schema.prisma`
  - Location: After User model (around line 50)
  - Add the following model:
  
  ```prisma
  model SellerApplication {
    id                        String              @id @default(uuid())
    userId                    String              @unique @map("user_id")
    businessName              String              @map("business_name")
    businessType              String              @map("business_type")
    businessRegistrationNumber String?            @map("business_registration_number")
    taxId                     String?             @map("tax_id")
    businessDescription       String              @map("business_description")
    businessAddress           String              @map("business_address")
    phoneNumber               String              @map("phone_number")
    businessDocuments         Json?               @map("business_documents")
    website                   String?
    status                    ApplicationStatus   @default(PENDING)
    rejectionReason           String?             @map("rejection_reason")
    reviewedBy                String?             @map("reviewed_by")
    reviewedAt                DateTime?           @map("reviewed_at")
    createdAt                 DateTime            @default(now()) @map("created_at")
    updatedAt                 DateTime            @updatedAt @map("updated_at")
    
    user                      User                @relation("SellerApplication", fields: [userId], references: [id], onDelete: Cascade)
    reviewer                  User?               @relation("ApplicationReviewer", fields: [reviewedBy], references: [id])
    
    @@index([status])
    @@index([userId])
    @@map("seller_applications")
  }
  ```

- [ ] **Add ApplicationStatus Enum**
  - Add at the end of schema file with other enums:
  
  ```prisma
  enum ApplicationStatus {
    PENDING
    APPROVED
    REJECTED
    UNDER_REVIEW
  }
  ```

- [ ] **Update User Model Relations**
  - Add to existing User model relations (around line 47):
  
  ```prisma
  sellerApplication   SellerApplication?  @relation("SellerApplication")
  reviewedApplications SellerApplication[] @relation("ApplicationReviewer")
  ```

- [ ] **Generate Prisma Client**
  - Run: `npx prisma generate`

- [ ] **Create and Apply Migration**
  - Run: `npx prisma migrate dev --name add_seller_application`
  - Verify migration was created in `prisma/migrations/`

---

### Phase 2: DTOs (Data Transfer Objects)

- [ ] **Create SellerApplicationDto**
  - File: `e-commerce-api/src/modules/auth/dto/seller-application.dto.ts` (NEW)
  - Purpose: Request body for seller application submission
  - Required fields: businessName, businessType, businessDescription, businessAddress, phoneNumber
  - Optional fields: businessRegistrationNumber, taxId, businessDocuments, website
  
  ```typescript
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl } from 'class-validator';

  export class SellerApplicationDto {
    @ApiProperty({ description: 'Business name', example: 'Tech Store Inc.' })
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @ApiProperty({ 
      description: 'Business type', 
      example: 'Company',
      enum: ['Individual', 'Company', 'Partnership', 'LLC']
    })
    @IsString()
    @IsNotEmpty()
    businessType: string;

    @ApiPropertyOptional({ description: 'Business registration number' })
    @IsString()
    @IsOptional()
    businessRegistrationNumber?: string;

    @ApiPropertyOptional({ description: 'Tax ID / GST number' })
    @IsString()
    @IsOptional()
    taxId?: string;

    @ApiProperty({ description: 'Business description' })
    @IsString()
    @IsNotEmpty()
    businessDescription: string;

    @ApiProperty({ description: 'Business address' })
    @IsString()
    @IsNotEmpty()
    businessAddress: string;

    @ApiProperty({ description: 'Business phone number' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiPropertyOptional({ description: 'Array of document URLs', type: [String] })
    @IsArray()
    @IsOptional()
    businessDocuments?: string[];

    @ApiPropertyOptional({ description: 'Business website' })
    @IsUrl()
    @IsOptional()
    website?: string;
  }
  ```

- [ ] **Create ReviewApplicationDto**
  - File: `e-commerce-api/src/modules/auth/dto/review-application.dto.ts` (NEW)
  - Purpose: Admin action to approve/reject application
  
  ```typescript
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { IsString, IsEnum, IsOptional } from 'class-validator';

  export class ReviewApplicationDto {
    @ApiProperty({ 
      description: 'Application decision',
      enum: ['APPROVED', 'REJECTED']
    })
    @IsEnum(['APPROVED', 'REJECTED'])
    status: 'APPROVED' | 'REJECTED';

    @ApiPropertyOptional({ description: 'Rejection reason (required if rejected)' })
    @IsString()
    @IsOptional()
    rejectionReason?: string;
  }
  ```

- [ ] **Create SellerApplicationResponseDto**
  - File: `e-commerce-api/src/modules/auth/dto/seller-application-response.dto.ts` (NEW)
  - Purpose: Response format for application data
  
  ```typescript
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

  export class SellerApplicationResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    businessName: string;

    @ApiProperty()
    businessType: string;

    @ApiPropertyOptional()
    businessRegistrationNumber?: string;

    @ApiPropertyOptional()
    taxId?: string;

    @ApiProperty()
    businessDescription: string;

    @ApiProperty()
    businessAddress: string;

    @ApiProperty()
    phoneNumber: string;

    @ApiPropertyOptional()
    businessDocuments?: string[];

    @ApiPropertyOptional()
    website?: string;

    @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] })
    status: string;

    @ApiPropertyOptional()
    rejectionReason?: string;

    @ApiPropertyOptional()
    reviewedBy?: string;

    @ApiPropertyOptional()
    reviewedAt?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
  }
  ```

- [ ] **Update DTO Index File**
  - File: `e-commerce-api/src/modules/auth/dto/index.ts`
  - Add exports:
  
  ```typescript
  export * from './seller-application.dto';
  export * from './review-application.dto';
  export * from './seller-application-response.dto';
  ```

---

### Phase 3: Service Layer

- [ ] **Add Import Statements to AuthService**
  - File: `e-commerce-api/src/modules/auth/auth.service.ts`
  - Add to imports:
  
  ```typescript
  import {
    SellerApplicationDto,
    ReviewApplicationDto,
    SellerApplicationResponseDto,
  } from './dto';
  import { NotFoundException, BadRequestException } from '@nestjs/common';
  ```

- [ ] **Add createSellerApplication Method**
  - Purpose: User submits seller application
  - Validations:
    - User exists
    - User is not already a seller
    - No pending application exists
    - Allow reapplication if previously rejected
  - Creates SellerApplication record with PENDING status
  
  ```typescript
  async createSellerApplication(
    userId: string,
    applicationDto: SellerApplicationDto,
  ): Promise<SellerApplicationResponseDto> {
    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already a seller
    if (user.role === Role.SELLER) {
      throw new BadRequestException('You are already a seller');
    }

    // Check if application already exists
    const existingApplication = await this.prismaService.sellerApplication.findUnique({
      where: { userId },
    });

    if (existingApplication) {
      if (existingApplication.status === 'PENDING' || existingApplication.status === 'UNDER_REVIEW') {
        throw new BadRequestException('You already have a pending application');
      }
      if (existingApplication.status === 'APPROVED') {
        throw new BadRequestException('Your application was already approved');
      }
      // If REJECTED, allow to reapply by updating existing
    }

    // Create or update application
    const application = existingApplication
      ? await this.prismaService.sellerApplication.update({
          where: { userId },
          data: {
            ...applicationDto,
            status: 'PENDING',
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
          },
        })
      : await this.prismaService.sellerApplication.create({
          data: {
            userId,
            ...applicationDto,
            status: 'PENDING',
          },
        });

    this.logger.log(`Seller application created/updated for user: ${user.email}`);

    return application as SellerApplicationResponseDto;
  }
  ```

- [ ] **Add getMyApplication Method**
  - Purpose: User checks their own application status
  
  ```typescript
  async getMyApplication(userId: string): Promise<SellerApplicationResponseDto | null> {
    const application = await this.prismaService.sellerApplication.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });

    return application as SellerApplicationResponseDto | null;
  }
  ```

- [ ] **Add getAllApplications Method**
  - Purpose: Admin lists all applications (with optional status filter)
  
  ```typescript
  async getAllApplications(status?: string) {
    const where = status ? { status } : {};
    
    return this.prismaService.sellerApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  ```

- [ ] **Add reviewApplication Method**
  - Purpose: Admin approves/rejects application
  - On APPROVED:
    - Updates user role to SELLER
    - Creates initial Store record
    - Updates application status
  - On REJECTED:
    - Stores rejection reason
    - Updates application status
  - Uses database transaction for consistency
  
  ```typescript
  async reviewApplication(
    applicationId: string,
    reviewDto: ReviewApplicationDto,
    reviewerId: string,
  ): Promise<SellerApplicationResponseDto> {
    const application = await this.prismaService.sellerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status === 'APPROVED') {
      throw new BadRequestException('Application already approved');
    }

    if (reviewDto.status === 'REJECTED' && !reviewDto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    // Use transaction to update application and user role if approved
    const result = await this.prismaService.$transaction(async (prisma) => {
      // Update application
      const updatedApplication = await prisma.sellerApplication.update({
        where: { id: applicationId },
        data: {
          status: reviewDto.status,
          rejectionReason: reviewDto.rejectionReason,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      });

      // If approved, update user role to SELLER and create initial store
      if (reviewDto.status === 'APPROVED') {
        await prisma.user.update({
          where: { id: application.userId },
          data: { role: Role.SELLER },
        });

        // Create initial store
        const slug = this.generateSlug(application.businessName);
        await prisma.store.create({
          data: {
            name: application.businessName,
            slug,
            description: application.businessDescription,
            sellerId: application.userId,
            status: 'APPROVED', // Auto-approve store
          },
        });

        this.logger.log(
          `Seller application APPROVED for user: ${application.user.email}. Store created.`,
        );
      } else {
        this.logger.log(
          `Seller application REJECTED for user: ${application.user.email}`,
        );
      }

      return updatedApplication;
    });

    return result as SellerApplicationResponseDto;
  }
  ```

- [ ] **Add generateSlug Helper Method**
  - Purpose: Create URL-friendly slug from business name
  
  ```typescript
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  ```

---

### Phase 4: Controller Layer

- [ ] **Add Imports to AuthController**
  - File: `e-commerce-api/src/modules/auth/auth.controller.ts`
  - Add to imports:
  
  ```typescript
  import {
    SellerApplicationDto,
    ReviewApplicationDto,
    SellerApplicationResponseDto,
  } from './dto';
  import { Param, Query } from '@nestjs/common';
  import { ApiQuery } from '@nestjs/swagger';
  ```

- [ ] **Add POST /auth/seller/apply Endpoint**
  - Purpose: Authenticated users submit seller application
  - Authentication: Required (JWT)
  - Authorization: Any authenticated user
  
  ```typescript
  @Post('seller/apply')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply to become a seller' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: SellerApplicationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Already a seller or pending application exists' })
  async applyAsSeller(
    @Req() req: any,
    @Body() applicationDto: SellerApplicationDto,
  ): Promise<SellerApplicationResponseDto> {
    return this.authService.createSellerApplication(req.user.id, applicationDto);
  }
  ```

- [ ] **Add GET /auth/seller/application Endpoint**
  - Purpose: User checks their application status
  - Authentication: Required (JWT)
  - Authorization: Any authenticated user
  
  ```typescript
  @Get('seller/application')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my seller application status' })
  @ApiResponse({
    status: 200,
    description: 'Application details',
    type: SellerApplicationResponseDto,
  })
  async getMyApplication(@Req() req: any) {
    return this.authService.getMyApplication(req.user.id);
  }
  ```

- [ ] **Add GET /auth/admin/seller-applications Endpoint**
  - Purpose: Admin lists all applications (with optional status filter)
  - Authentication: Required (JWT)
  - Authorization: ADMIN only
  
  ```typescript
  @Get('admin/seller-applications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all seller applications (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] })
  async getAllApplications(@Query('status') status?: string) {
    return this.authService.getAllApplications(status);
  }
  ```

- [ ] **Add PATCH /auth/admin/seller-applications/:id/review Endpoint**
  - Purpose: Admin reviews and approves/rejects application
  - Authentication: Required (JWT)
  - Authorization: ADMIN only
  
  ```typescript
  @Patch('admin/seller-applications/:id/review')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Review seller application (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed',
    type: SellerApplicationResponseDto,
  })
  async reviewApplication(
    @Param('id') id: string,
    @Body() reviewDto: ReviewApplicationDto,
    @Req() req: any,
  ): Promise<SellerApplicationResponseDto> {
    return this.authService.reviewApplication(id, reviewDto, req.user.id);
  }
  ```

---

### Phase 5: Testing & Validation

- [ ] **Test User Registration Flow**
  - Register new user: `POST /api/v1/auth/register`
  - Login: `POST /api/v1/auth/login`
  - Verify JWT token is returned

- [ ] **Test Seller Application Submission**
  - Endpoint: `POST /api/v1/auth/seller/apply`
  - Headers: `Authorization: Bearer <user_token>`
  - Body:
    ```json
    {
      "businessName": "Tech Store Inc.",
      "businessType": "Company",
      "businessDescription": "Electronics and gadgets store",
      "businessAddress": "123 Tech Street, Silicon Valley, CA",
      "phoneNumber": "+1-555-0123",
      "taxId": "TAX-12345",
      "website": "https://techstore.example.com"
    }
    ```
  - Expected: 201 Created with application details
  - Verify: status = "PENDING"

- [ ] **Test Application Status Check**
  - Endpoint: `GET /api/v1/auth/seller/application`
  - Headers: `Authorization: Bearer <user_token>`
  - Expected: 200 OK with application details or null

- [ ] **Test Duplicate Application Prevention**
  - Try to submit application again with same user
  - Expected: 400 Bad Request "You already have a pending application"

- [ ] **Test Admin List Applications**
  - Login as admin
  - Endpoint: `GET /api/v1/auth/admin/seller-applications`
  - Headers: `Authorization: Bearer <admin_token>`
  - Expected: 200 OK with array of applications
  - Test with status filter: `GET /api/v1/auth/admin/seller-applications?status=PENDING`

- [ ] **Test Admin Approval Flow**
  - Endpoint: `PATCH /api/v1/auth/admin/seller-applications/:id/review`
  - Headers: `Authorization: Bearer <admin_token>`
  - Body:
    ```json
    {
      "status": "APPROVED"
    }
    ```
  - Expected: 200 OK
  - Verify in database:
    - User role changed to SELLER
    - Store created with business name
    - Store status is APPROVED
    - Application status is APPROVED
    - reviewedBy and reviewedAt are set

- [ ] **Test Admin Rejection Flow**
  - Submit another application with different user
  - Endpoint: `PATCH /api/v1/auth/admin/seller-applications/:id/review`
  - Body:
    ```json
    {
      "status": "REJECTED",
      "rejectionReason": "Incomplete business documentation"
    }
    ```
  - Expected: 200 OK
  - Verify: Application status is REJECTED with reason stored

- [ ] **Test Reapplication After Rejection**
  - Use rejected user account
  - Submit new application: `POST /api/v1/auth/seller/apply`
  - Expected: Should allow reapplication (updates existing record)

- [ ] **Test Authorization Guards**
  - Try accessing admin endpoints without token: Expected 401
  - Try accessing admin endpoints with user token: Expected 403
  - Verify only admins can review applications

- [ ] **Test Edge Cases**
  - User already a SELLER tries to apply: Expected 400 "Already a seller"
  - Admin reviews already approved application: Expected 400 "Already approved"
  - Admin rejects without reason: Expected 400 "Rejection reason required"

---

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/seller/apply` | Yes | USER | Submit seller application |
| GET | `/auth/seller/application` | Yes | USER | Get my application status |
| GET | `/auth/admin/seller-applications` | Yes | ADMIN | List all applications |
| PATCH | `/auth/admin/seller-applications/:id/review` | Yes | ADMIN | Approve/reject application |

---

## Database Tables

### User (existing)
- Stores authentication credentials
- Role field determines if user is SELLER
- Single source of truth for login

### SellerApplication (new)
- Links to User via userId (unique)
- Stores business verification data
- Tracks application status and review history

### Store (existing)
- Auto-created on approval
- Links to User via sellerId
- Created with APPROVED status

---

## Data Flow

```
1. User Registration
   → Creates User (role: USER, status: ACTIVE)

2. Seller Application
   → Creates SellerApplication (status: PENDING)
   → User still logs in with same credentials

3. Admin Review (Approve)
   → Updates SellerApplication (status: APPROVED)
   → Updates User (role: SELLER)
   → Creates Store (status: APPROVED)

4. Admin Review (Reject)
   → Updates SellerApplication (status: REJECTED, rejectionReason)
   → User remains USER role
   → Can reapply later
```

---

## Benefits

1. **Single Authentication Source**: User table handles all logins
2. **No Data Duplication**: Email/password stored once
3. **Audit Trail**: Complete history in SellerApplication table
4. **Professional**: Self-service reduces admin workload
5. **Scalable**: Can handle many applications
6. **Compliant**: Collects business verification data
7. **Flexible**: Supports rejection and reapplication

---

## Future Enhancements (Optional)

- [ ] Email notifications on approval/rejection
- [ ] Document upload to S3 for business verification
- [ ] Application expiry after X days
- [ ] Multi-step application form
- [ ] Seller dashboard showing application progress
- [ ] Analytics: time to approval, rejection rates
- [ ] Webhook notifications for admins on new applications
- [ ] SMS verification for business phone number

---

## Notes

- The User table always contains authentication data from initial registration
- SellerApplication only stores additional business information
- No duplicate emails possible (unique constraint on User.email)
- Store is automatically created with the business name from the application
- Admins can filter applications by status for easier management
- Rejected users can reapply by submitting a new application

