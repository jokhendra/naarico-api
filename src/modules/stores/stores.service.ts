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

