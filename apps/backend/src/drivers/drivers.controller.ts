import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName, DriverStatus, VerificationStatus } from '@prisma/client';
import { DriversService } from './drivers.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Drivers')
@ApiBearerAuth('firebase-auth')
@Controller('drivers')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
  @ApiOperation({ summary: 'List all drivers with search, status filtering, and pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: DriverStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: DriverStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const data = await this.driversService.findAll(search, status, skip, Number(limit));
    return {
      success: true,
      data,
      message: 'Drivers retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.DRIVER)
  @ApiOperation({ summary: 'Get detailed driver profile, vehicles, and trip history' })
  async findOne(@Param('id') id: string) {
    const data = await this.driversService.findOne(id);
    return {
      success: true,
      data,
      message: 'Driver details retrieved successfully',
    };
  }

  @Patch(':id/verify')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update driver license/KYC verification status' })
  async updateVerification(
    @Param('id') id: string,
    @Body('verificationStatus') verificationStatus: VerificationStatus,
  ) {
    const data = await this.driversService.updateVerification(id, verificationStatus);
    return {
      success: true,
      data,
      message: 'Driver verification updated successfully',
    };
  }
}
