import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RoleName, UserStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { FirebaseAdminService } from '../src/firebase/firebase-admin.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Agriculture Backend E2E Tests (Phase 3 Auth & RBAC)', () => {
  let app: INestApplication;
  let mockFirebaseAdmin: jest.Mocked<Partial<FirebaseAdminService>>;
  let mockPrisma: jest.Mocked<Partial<PrismaService>>;

  const farmerUser = {
    id: 'user-farmer-uuid',
    firebaseUid: 'fb-farmer-uid',
    email: 'farmer@example.com',
    phone: '+919876543210',
    fullName: 'Ramesh Farmer',
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    roleId: 'role-farmer-id',
    role: {
      id: 'role-farmer-id',
      name: RoleName.FARMER,
      rolePermissions: [{ permission: { name: 'crops:read' } }],
    },
  };

  const adminUser = {
    id: 'user-admin-uuid',
    firebaseUid: 'fb-admin-uid',
    email: 'admin@example.com',
    phone: '+919876543211',
    fullName: 'Central Administrator',
    avatarUrl: null,
    status: UserStatus.ACTIVE,
    roleId: 'role-admin-id',
    role: {
      id: 'role-admin-id',
      name: RoleName.ADMIN,
      rolePermissions: [
        { permission: { name: 'users:read' } },
        { permission: { name: 'crops:read' } },
      ],
    },
  };

  beforeAll(async () => {
    mockFirebaseAdmin = {
      isReady: jest.fn().mockReturnValue(true),
      verifyIdToken: jest.fn().mockImplementation(async (token: string) => {
        if (token === 'token-farmer') {
          return { uid: 'fb-farmer-uid', email: 'farmer@example.com' } as any;
        }
        if (token === 'token-admin') {
          return { uid: 'fb-admin-uid', email: 'admin@example.com' } as any;
        }
        throw new Error('Invalid Firebase Token');
      }),
    };

    mockPrisma = {
      user: {
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          if (where.firebaseUid === 'fb-farmer-uid') return farmerUser;
          if (where.firebaseUid === 'fb-admin-uid') return adminUser;
          return null;
        }),
      } as any,
      isHealthy: jest.fn().mockResolvedValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseAdminService)
      .useValue(mockFirebaseAdmin)
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Public Routes', () => {
    it('GET /api/v1/health should be publicly accessible without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('ok');
        });
    });
  });

  describe('2. Authentication Guard & Token Verification', () => {
    it('GET /api/v1/auth/me should return 401 when Authorization header is missing', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('Unauthorized');
        });
    });

    it('GET /api/v1/auth/me should return 401 when token is invalid', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('GET /api/v1/auth/me should return 200 with authenticated profile for valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token-farmer')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe('user-farmer-uuid');
          expect(res.body.data.role).toBe(RoleName.FARMER);
          expect(res.body.data.permissions).toContain('crops:read');
        });
    });
  });

  describe('3. Role-Based Access Control (RBAC)', () => {
    it('GET /api/v1/auth/test/admin should return 403 Forbidden for FARMER role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/test/admin')
        .set('Authorization', 'Bearer token-farmer')
        .expect(403)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toContain('Forbidden');
        });
    });

    it('GET /api/v1/auth/test/admin should return 200 OK for ADMIN role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/test/admin')
        .set('Authorization', 'Bearer token-admin')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.role).toBe(RoleName.ADMIN);
        });
    });

    it('GET /api/v1/auth/test/farmer should return 200 OK for FARMER role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/test/farmer')
        .set('Authorization', 'Bearer token-farmer')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.role).toBe(RoleName.FARMER);
        });
    });
  });

  describe('4. Granular Permission-Based Authorization', () => {
    it('GET /api/v1/auth/test/permission-crops-read should return 200 OK for user with crops:read', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/test/permission-crops-read')
        .set('Authorization', 'Bearer token-farmer')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.permissions).toContain('crops:read');
        });
    });
  });

  describe('5. Error Handling', () => {
    it('GET /api/v1/non-existent-route should return 404 with structured error envelope', () => {
      return request(app.getHttpServer())
        .get('/api/v1/non-existent-route')
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.data).toBe(null);
        });
    });
  });
});
