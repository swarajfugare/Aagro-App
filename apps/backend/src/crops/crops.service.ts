import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string, search?: string) {
    if (!process.env.DATABASE_URL) {
      return [];
    }

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { scientificName: { contains: search } },
        { category: { contains: search } },
      ];
    }

    return this.prisma.crop.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        varieties: true,
        _count: {
          select: {
            farmerCrops: true,
            supplyBatches: true,
            buyerRequirements: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Crop with ID ${id} not found`);
    }

    const crop = await this.prisma.crop.findUnique({
      where: { id },
      include: {
        varieties: true,
        _count: {
          select: {
            farmerCrops: true,
            supplyBatches: true,
            buyerRequirements: true,
          },
        },
      },
    });

    if (!crop) {
      throw new NotFoundException(`Crop with ID ${id} not found`);
    }

    return crop;
  }

  async create(data: {
    name: string;
    scientificName?: string;
    category: string;
    description?: string;
    imageUrl?: string;
  }) {
    return this.prisma.crop.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      scientificName?: string;
      category?: string;
      description?: string;
      imageUrl?: string;
    },
  ) {
    return this.prisma.crop.update({
      where: { id },
      data,
    });
  }

  async addVariety(cropId: string, data: { name: string; description?: string; season?: string; maturityDays?: number }) {
    return this.prisma.cropVariety.create({
      data: {
        cropId,
        ...data,
      },
    });
  }
}
