import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName, RequirementStatus } from '@prisma/client';
import { DemandService } from './demand.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Demand')
@ApiBearerAuth('firebase-auth')
@Controller('demand')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
  @ApiOperation({ summary: 'List buyer demand requirements with filtering and pagination' })
  @ApiQuery({ name: 'status', enum: RequirementStatus, required: false })
  @ApiQuery({ name: 'cropId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('status') status?: RequirementStatus,
    @Query('cropId') cropId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const data = await this.demandService.findAll(status, cropId, skip, Number(limit));
    return {
      success: true,
      data,
      message: 'Demand requirements retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.BUYER)
  @ApiOperation({ summary: 'Get buyer demand requirement detail' })
  async findOne(@Param('id') id: string) {
    const data = await this.demandService.findOne(id);
    return {
      success: true,
      data,
      message: 'Demand requirement details retrieved successfully',
    };
  }
}
