import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { CropsService } from './crops.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Crops')
@ApiBearerAuth('firebase-auth')
@Controller('crops')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all crops with varieties and categories' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query('category') category?: string, @Query('search') search?: string) {
    const data = await this.cropsService.findAll(category, search);
    return {
      success: true,
      data,
      message: 'Crops catalog retrieved successfully',
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get crop detail by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.cropsService.findOne(id);
    return {
      success: true,
      data,
      message: 'Crop retrieved successfully',
    };
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new crop in catalog' })
  async create(
    @Body()
    body: {
      name: string;
      scientificName?: string;
      category: string;
      description?: string;
      imageUrl?: string;
    },
  ) {
    const data = await this.cropsService.create(body);
    return {
      success: true,
      data,
      message: 'Crop created successfully',
    };
  }

  @Put(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update crop details' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      scientificName?: string;
      category?: string;
      description?: string;
      imageUrl?: string;
    },
  ) {
    const data = await this.cropsService.update(id, body);
    return {
      success: true,
      data,
      message: 'Crop updated successfully',
    };
  }

  @Post(':id/varieties')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add a new variety to a crop' })
  async addVariety(
    @Param('id') id: string,
    @Body() body: { name: string; description?: string; season?: string; maturityDays?: number },
  ) {
    const data = await this.cropsService.addVariety(id, body);
    return {
      success: true,
      data,
      message: 'Crop variety added successfully',
    };
  }
}
