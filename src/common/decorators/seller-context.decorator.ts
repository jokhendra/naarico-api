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

