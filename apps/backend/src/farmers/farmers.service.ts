import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FarmersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, status?: VerificationStatus, skip = 0, take = 50) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0 };
    }

    const where: any = {};
    if (status) {
      where.kycStatus = status;
    }
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search } } },
        { user: { phone: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.farmer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
              avatarUrl: true,
            },
          },
          village: { include: { district: { include: { state: true } } } },
          _count: {
            select: {
              farms: true,
              farmerCrops: true,
              supplyBatches: true,
            },
          },
        },
      }),
      this.prisma.farmer.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Farmer with ID ${id} not found`);
    }

    const farmer = await this.prisma.farmer.findUnique({
      where: { id },
      include: {
        user: true,
        village: { include: { district: { include: { state: true } } } },
        farms: true,
        farmerCrops: {
          include: {
            crop: true,
            variety: true,
            productions: true,
            harvests: true,
          },
        },
        supplyBatches: {
          include: {
            crop: true,
            variety: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        farmerDocuments: true,
      },
    });

    if (!farmer) {
      throw new NotFoundException(`Farmer with ID ${id} not found`);
    }

    return farmer;
  }

  async updateVerification(id: string, kycStatus: VerificationStatus) {
    return this.prisma.farmer.update({
      where: { id },
      data: { kycStatus },
    });
  }
}
