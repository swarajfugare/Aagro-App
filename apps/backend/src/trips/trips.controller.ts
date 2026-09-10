import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName, TripStatus } from '@prisma/client';
import { TripsService } from './trips.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Trips')
@ApiBearerAuth('firebase-auth')
@Controller('trips')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.DRIVER)
  @ApiOperation({ summary: 'List trips with status and driver filters' })
  @ApiQuery({ name: 'status', enum: TripStatus, required: false })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('status') status?: TripStatus,
    @Query('driverId') driverId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const data = await this.tripsService.findAll(status, driverId, skip, Number(limit));
    return {
      success: true,
      data,
      message: 'Trips retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.DRIVER)
  @ApiOperation({ summary: 'Get trip details with multi-stop progression and route' })
  async findOne(@Param('id') id: string) {
    const data = await this.tripsService.findOne(id);
    return {
      success: true,
      data,
      message: 'Trip details retrieved successfully',
    };
  }
}
