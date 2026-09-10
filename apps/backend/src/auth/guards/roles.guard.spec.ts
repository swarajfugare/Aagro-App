import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName, UserStatus } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockExecutionContext = (user?: any, isPublic = false): ExecutionContext => {
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

    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if route has no required roles', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(undefined); // requiredRoles

    const context = createMockExecutionContext({ role: RoleName.FARMER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has the exact required role', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([RoleName.ADMIN]);

    const context = createMockExecutionContext({ role: RoleName.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access to SUPER_ADMIN unconditionally', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([RoleName.DRIVER]);

    const context = createMockExecutionContext({ role: RoleName.SUPER_ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required role', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([RoleName.ADMIN]);

    const context = createMockExecutionContext({ role: RoleName.FARMER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
