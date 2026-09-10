import { Injectable, NotFoundException } from '@nestjs/common';
import { SupplyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: SupplyStatus, cropId?: string, skip = 0, take = 50) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0 };
    }

    const where: any = {};
    if (status) where.status = status;
    if (cropId) where.cropId = cropId;

    const [items, total] = await Promise.all([
      this.prisma.supplyBatch.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: { include: { user: { select: { fullName: true, phone: true } } } },
          crop: true,
          variety: true,
          _count: {
            select: { matchItems: true, orderItems: true },
          },
        },
      }),
      this.prisma.supplyBatch.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Supply batch with ID ${id} not found`);
    }

    const supply = await this.prisma.supplyBatch.findUnique({
      where: { id },
      include: {
        farmer: {
          include: {
            user: true,
            village: { include: { district: { include: { state: true } } } },
          },
        },
        crop: true,
        variety: true,
        harvest: true,
        farmerCrop: true,
        matchItems: {
          include: { match: { include: { requirement: { include: { buyer: true } } } } },
        },
        orderItems: {
          include: { order: true },
        },
      },
    });

    if (!supply) {
      throw new NotFoundException(`Supply batch with ID ${id} not found`);
    }

    return supply;
  }
}
