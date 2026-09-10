import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName, UserStatus } from '@prisma/client';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    const request = { user };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new PermissionsGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if route has no required permissions', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(undefined); // requiredPermissions

    const context = createMockExecutionContext({ permissions: ['crops:read'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has all required permissions', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['crops:read', 'supply:create']);

    const context = createMockExecutionContext({
      role: RoleName.FARMER,
      permissions: ['crops:read', 'supply:create', 'supply:read'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access to SUPER_ADMIN regardless of individual permissions', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['settings:manage']);

    const context = createMockExecutionContext({
      role: RoleName.SUPER_ADMIN,
      permissions: [],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks any required permission', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['orders:create', 'orders:cancel']);

    const context = createMockExecutionContext({
      role: RoleName.BUYER,
      permissions: ['orders:create'],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
