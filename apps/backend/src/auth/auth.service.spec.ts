import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RoleName, UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let firebaseAdminService: jest.Mocked<Partial<FirebaseAdminService>>;
  let prismaService: jest.Mocked<Partial<PrismaService>>;

  const mockUserRecord = {
    id: 'user-uuid-123',
    firebaseUid: 'fb-uid-123',
    email: 'farmer@example.com',
    phone: '+919876543210',
    fullName: 'Ramesh Patil',
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    roleId: 'role-farmer-id',
    role: {
      id: 'role-farmer-id',
      name: RoleName.FARMER,
      rolePermissions: [
        { permission: { name: 'crops:read' } },
        { permission: { name: 'supply:create' } },
      ],
    },
  };

  beforeEach(async () => {
    firebaseAdminService = {
      verifyIdToken: jest.fn(),
      isReady: jest.fn().mockReturnValue(true),
    };

    prismaService = {
      user: {
        findUnique: jest.fn(),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: FirebaseAdminService, useValue: firebaseAdminService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyFirebaseToken', () => {
    it('should return decoded token when token is valid', async () => {
      const mockDecoded = { uid: 'fb-uid-123', email: 'farmer@example.com' };
      (firebaseAdminService.verifyIdToken as jest.Mock).mockResolvedValue(mockDecoded as any);

      const result = await service.verifyFirebaseToken('valid-token');
      expect(result).toEqual(mockDecoded);
      expect(firebaseAdminService.verifyIdToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      (firebaseAdminService.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Token expired'));

      await expect(service.verifyFirebaseToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return AuthenticatedUser context for an active registered user', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue(mockUserRecord as any);

      const user = await service.getAuthenticatedUser('fb-uid-123');

      expect(user.id).toBe('user-uuid-123');
      expect(user.firebaseUid).toBe('fb-uid-123');
      expect(user.role).toBe(RoleName.FARMER);
      expect(user.permissions).toEqual(['crops:read', 'supply:create']);
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    it('should throw UnauthorizedException if user is not in MySQL database', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getAuthenticatedUser('unknown-fb-uid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user account is SUSPENDED', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue({
        ...mockUserRecord,
        status: UserStatus.SUSPENDED,
      } as any);

      await expect(service.getAuthenticatedUser('fb-uid-123')).rejects.toThrow(
        'User account has been suspended',
      );
    });

    it('should throw UnauthorizedException if user account is INACTIVE', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue({
        ...mockUserRecord,
        status: UserStatus.INACTIVE,
      } as any);

      await expect(service.getAuthenticatedUser('fb-uid-123')).rejects.toThrow(
        'User account is inactive',
      );
    });
  });
});
