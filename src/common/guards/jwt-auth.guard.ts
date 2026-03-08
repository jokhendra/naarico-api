import { Injectable, ExecutionContext, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

// Custom decorator for marking routes as public (no auth required)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // For public routes, try to authenticate if token is present,
    // but don't fail if there's no token (optional authentication)
    if (isPublic) {
      return super.canActivate(context) as Promise<boolean> | boolean;
    }

    // For non-public routes, use the standard JWT auth guard
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // For public routes, allow request even without user (optional auth)
    // But if a user is authenticated, attach them to the request
    if (isPublic) {
      // If there's an error during JWT validation on a public route, ignore it
      // and just return null (unauthenticated request)
      return user || null;
    }

    // For protected routes, enforce authentication
    // If there's an error from JWT validation, throw it
    if (err) {
      // Log the actual error for debugging
      console.error('JWT Authentication Error:', {
        error: err.message,
        name: err.name,
        info: info,
        route: context.switchToHttp().getRequest().url,
      });
      throw err;
    }
    
    // If no user was extracted from token, authentication failed
    if (!user) {
      console.error('JWT Authentication Failed: No user extracted', {
        info: info,
        route: context.switchToHttp().getRequest().url,
      });
      throw new UnauthorizedException('Authentication required');
    }

    return user;
  }
}
