import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Verifies Firebase ID Token using Firebase Admin SDK
   */
  async verifyFirebaseToken(idToken: string) {
    try {
      return await this.firebaseAdminService.verifyIdToken(idToken);
    } catch (error) {
      this.logger.warn(`Firebase token verification failed: ${error instanceof Error ? error.message : error}`);
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }

  /**
   * Loads the application user from MySQL by verified Firebase UID.
   * Loads assigned Role and associated Permissions.
   * Enforces user account status checks (rejects INACTIVE or SUSPENDED accounts).
   */
  async getAuthenticatedUser(firebaseUid: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      this.logger.warn(`Authentication rejected: No MySQL user record found for Firebase UID ${firebaseUid}`);
      throw new UnauthorizedException('User account is not registered. Please complete registration first.');
    }

    if (user.status === UserStatus.SUSPENDED) {
      this.logger.warn(`Authentication rejected: User ${user.id} is SUSPENDED`);
      throw new UnauthorizedException('User account has been suspended. Please contact support.');
    }

    if (user.status === UserStatus.INACTIVE) {
      this.logger.warn(`Authentication rejected: User ${user.id} is INACTIVE`);
      throw new UnauthorizedException('User account is inactive.');
    }

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.name);

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roleId: user.roleId,
      role: user.role.name,
      permissions,
    };
  }

  /**
   * Formats safe user profile for /api/v1/auth/me
   */
  getMe(user: AuthenticatedUser): UserProfileDto {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: user.role,
      permissions: user.permissions,
    };
  }
}
