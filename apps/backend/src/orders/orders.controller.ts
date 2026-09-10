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
import { RoleName, OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Orders')
@ApiBearerAuth('firebase-auth')
@Controller('orders')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.BUYER, RoleName.FARMER)
  @ApiOperation({ summary: 'List orders with status, date, and buyer filters' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'buyerId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('buyerId') buyerId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const data = await this.ordersService.findAll(status, buyerId, skip, Number(limit));
    return {
      success: true,
      data,
      message: 'Orders retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.BUYER, RoleName.FARMER, RoleName.DRIVER)
  @ApiOperation({ summary: 'Get order details with line items and status lifecycle history' })
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return {
      success: true,
      data,
      message: 'Order details retrieved successfully',
    };
  }

  @Patch(':id/status')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
  @ApiOperation({ summary: 'Transition order state machine status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Body('reason') reason?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const data = await this.ordersService.updateStatus(id, status, user?.id, reason);
    return {
      success: true,
      data,
      message: 'Order status updated successfully',
    };
  }
}
