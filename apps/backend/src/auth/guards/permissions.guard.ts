import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('Forbidden: Unauthenticated user context.');
    }

    // SUPER_ADMIN has unrestricted permission access
    if (user.role === RoleName.SUPER_ADMIN) {
      return true;
    }

    const userPermissions = new Set(user.permissions || []);
    const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.has(perm));

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Forbidden: Missing required permission(s) [${requiredPermissions.join(', ')}].`,
      );
    }

    return true;
  }
}
