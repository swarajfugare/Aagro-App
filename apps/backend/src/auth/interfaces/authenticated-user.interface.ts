import { RoleName, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  roleId: string;
  role: RoleName;
  permissions: string[];
}
