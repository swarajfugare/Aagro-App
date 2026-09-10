import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName, UserStatus } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Application User ID' })
  id: string;

  @ApiProperty({ example: 'firebase-uid-12345', description: 'Firebase Authentication UID' })
  firebaseUid: string;

  @ApiPropertyOptional({ example: 'farmer@example.com', description: 'User email address' })
  email: string | null;

  @ApiPropertyOptional({ example: '+919876543210', description: 'User phone number' })
  phone: string | null;

  @ApiProperty({ example: 'Ramesh Patil', description: 'Full name of the user' })
  fullName: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar profile URL' })
  avatarUrl: string | null;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'User account status' })
  status: UserStatus;

  @ApiProperty({ enum: RoleName, example: RoleName.FARMER, description: 'Application assigned role' })
  role: RoleName;

  @ApiProperty({
    example: ['crops:read', 'supply:create', 'supply:read'],
    description: 'List of granular permissions granted to the user',
    type: [String],
  })
  permissions: string[];
}
