import { Test, TestingModule } from '@nestjs/testing';
import { RoleName, UserStatus } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-123',
    firebaseUid: 'fb-uid-123',
    email: 'farmer@example.com',
    phone: '+919876543210',
    fullName: 'Ramesh Patil',
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    roleId: 'role-123',
    role: RoleName.FARMER,
    permissions: ['crops:read', 'supply:create'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: FirebaseAdminService,
          useValue: {
            verifyIdToken: jest.fn(),
            isReady: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the authenticated user profile on getMe', () => {
    const result = controller.getMe(mockUser);
    expect(result.success).toBe(true);
    expect(result.data.id).toBe('user-uuid-123');
    expect(result.data.firebaseUid).toBe('fb-uid-123');
    expect(result.data.role).toBe(RoleName.FARMER);
    expect(result.data.permissions).toEqual(['crops:read', 'supply:create']);
  });
});
