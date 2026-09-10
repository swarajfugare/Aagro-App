import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags('Authentication')
@ApiBearerAuth('firebase-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get Authenticated User Profile',
    description:
      'Returns the verified application profile, role, status, and permissions for the authenticated Firebase user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing Firebase token' })
  @ApiResponse({ status: 403, description: 'Forbidden: Account inactive or suspended' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    const profile = this.authService.getMe(user);
    return {
      success: true,
      data: profile,
      message: 'Authenticated user profile retrieved successfully',
    };
  }

  // ==============================================================================
  // RBAC & PERMISSION TEST VERIFICATION ENDPOINTS
  // ==============================================================================

  @Get('test/admin')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'RBAC Verification: Admin Endpoint (Test)',
    description: 'Accessible only by users with ADMIN or SUPER_ADMIN role.',
  })
  testAdminAccess(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: { role: user.role, userId: user.id },
      message: 'Admin authorization verified',
    };
  }

  @Get('test/farmer')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RoleName.FARMER)
  @ApiOperation({
    summary: 'RBAC Verification: Farmer Endpoint (Test)',
    description: 'Accessible only by users with FARMER role.',
  })
  testFarmerAccess(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: { role: user.role, userId: user.id },
      message: 'Farmer authorization verified',
    };
  }

  @Get('test/buyer')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RoleName.BUYER)
  @ApiOperation({
    summary: 'RBAC Verification: Buyer Endpoint (Test)',
    description: 'Accessible only by users with BUYER role.',
  })
  testBuyerAccess(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: { role: user.role, userId: user.id },
      message: 'Buyer authorization verified',
    };
  }

  @Get('test/driver')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(RoleName.DRIVER)
  @ApiOperation({
    summary: 'RBAC Verification: Driver Endpoint (Test)',
    description: 'Accessible only by users with DRIVER role.',
  })
  testDriverAccess(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: { role: user.role, userId: user.id },
      message: 'Driver authorization verified',
    };
  }

  @Get('test/permission-crops-read')
  @UseGuards(FirebaseAuthGuard, PermissionsGuard)
  @RequirePermissions('crops:read')
  @ApiOperation({
    summary: 'Permission Verification: crops:read (Test)',
    description: 'Accessible only by users holding the crops:read permission (or SUPER_ADMIN).',
  })
  testPermissionAccess(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: { permissions: user.permissions, userId: user.id },
      message: 'Permission authorization verified',
    };
  }
}
