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

