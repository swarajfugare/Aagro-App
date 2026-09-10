import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName, SupplyStatus } from '@prisma/client';
import { SupplyService } from './supply.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Supply')
@ApiBearerAuth('firebase-auth')
@Controller('supply')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.BUYER)
  @ApiOperation({ summary: 'List supply batches with status and crop filtering' })
  @ApiQuery({ name: 'status', enum: SupplyStatus, required: false })
  @ApiQuery({ name: 'cropId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('status') status?: SupplyStatus,
    @Query('cropId') cropId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const data = await this.supplyService.findAll(status, cropId, skip, Number(limit));
    return {
      success: true,
      data,
      message: 'Supply batches retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.FARMER, RoleName.BUYER)
  @ApiOperation({ summary: 'Get supply batch details' })
  async findOne(@Param('id') id: string) {
    const data = await this.supplyService.findOne(id);
    return {
      success: true,
      data,
      message: 'Supply batch details retrieved successfully',
    };
  }
}
