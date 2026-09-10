import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('firebase-auth')
@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Admin Dashboard Metrics',
    description: 'Retrieves aggregated platform counts, crop distribution, supply/demand analytics, recent orders, and operational alerts.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  async getDashboard() {
    const data = await this.adminService.getDashboardStats();
    return {
      success: true,
      data,
      message: 'Dashboard statistics retrieved successfully',
    };
  }
}
