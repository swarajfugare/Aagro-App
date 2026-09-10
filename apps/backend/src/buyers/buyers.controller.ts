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
import { RoleName, VerificationStatus } from '@prisma/client';
import { BuyersService } from './buyers.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Buyers')
@ApiBearerAuth('firebase-auth')
@Controller('buyers')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
  @ApiOperation({ summary: 'List all commercial buyers with search, filtering, and pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: VerificationStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: VerificationStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const data = await this.buyersService.findAll(search, status, skip, Number(limit));
    return {
      success: true,
      data,
      message: 'Buyers retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.BUYER)
  @ApiOperation({ summary: 'Get detailed buyer profile, requirements, and orders' })
  async findOne(@Param('id') id: string) {
    const data = await this.buyersService.findOne(id);
    return {
      success: true,
      data,
      message: 'Buyer details retrieved successfully',
    };
  }

  @Patch(':id/verify')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update buyer business verification status' })
  async updateVerification(
    @Param('id') id: string,
    @Body('verificationStatus') verificationStatus: VerificationStatus,
  ) {
    const data = await this.buyersService.updateVerification(id, verificationStatus);
    return {
      success: true,
      data,
      message: 'Buyer verification updated successfully',
    };
  }
}
