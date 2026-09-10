import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName, UserStatus } from '@prisma/client';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthService } from '../auth.service';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockAuthenticatedUser = {
    id: 'user-uuid-123',
    firebaseUid: 'fb-uid-123',
    email: 'farmer@example.com',
    phone: '+919876543210',
    fullName: 'Ramesh Patil',
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    roleId: 'role-123',
    role: RoleName.FARMER,
    permissions: ['crops:read'],
  };

  const createMockExecutionContext = (authHeader?: string, isPublic = false): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
      user: undefined,
    };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    authService = {
      verifyFirebaseToken: jest.fn(),
      getAuthenticatedUser: jest.fn(),
    };

    guard = new FirebaseAuthGuard(reflector, authService as AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if endpoint is marked with @Public()', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockExecutionContext();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(authService.verifyFirebaseToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if Authorization header is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockExecutionContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Missing or invalid Authorization header. Expected Bearer token.'),
    );
  });

  it('should throw UnauthorizedException if Authorization header is not Bearer format', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockExecutionContext('Basic dXNlcjpwYXNz');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should authenticate and attach request.user for valid token and active user', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockExecutionContext('Bearer valid-firebase-token');

    (authService.verifyFirebaseToken as jest.Mock).mockResolvedValue({ uid: 'fb-uid-123' });
    (authService.getAuthenticatedUser as jest.Mock).mockResolvedValue(mockAuthenticatedUser);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(mockAuthenticatedUser);
  });
});
