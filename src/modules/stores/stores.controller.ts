import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreStatusDto } from './dto/update-store-status.dto';
import { ToggleVacationDto } from './dto/toggle-vacation.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetSellerContext, SellerContext } from '../../common/decorators/seller-context.decorator';
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
    if (!context.sellerId) {
      throw new ForbiddenException('Seller ID not found');
    }
    return this.storesService.create(createStoreDto, context.sellerId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all stores' })
  findAll(@GetSellerContext() context: SellerContext) {
    const sellerId = context.isAdmin ? undefined : (context.sellerId || undefined);
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
    const sellerId = context.sellerId || '';
    return this.storesService.update(id, updateStoreDto, sellerId, context.isAdmin);
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
    const sellerId = context.sellerId || '';
    return this.storesService.toggleVacation(id, toggleVacationDto, sellerId, context.isAdmin);
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
    const sellerId = context.sellerId || '';
    return this.storesService.remove(id, sellerId, context.isAdmin);
  }
}

