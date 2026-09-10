import { Injectable, NotFoundException } from '@nestjs/common';
import { RequirementStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DemandService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: RequirementStatus, cropId?: string, skip = 0, take = 50) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0 };
    }

    const where: any = {};
    if (status) where.status = status;
    if (cropId) where.cropId = cropId;

    const [items, total] = await Promise.all([
      this.prisma.buyerRequirement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { include: { user: { select: { fullName: true, phone: true } } } },
          crop: true,
          variety: true,
          deliveryVillage: { include: { district: true } },
          _count: { select: { matches: true } },
        },
      }),
      this.prisma.buyerRequirement.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    const requirement = await this.prisma.buyerRequirement.findUnique({
      where: { id },
      include: {
        buyer: {
          include: {
            user: true,
            village: { include: { district: { include: { state: true } } } },
          },
        },
        crop: true,
        variety: true,
        deliveryVillage: { include: { district: { include: { state: true } } } },
        matches: {
          include: {
            matchItems: {
              include: {
                supplyBatch: {
                  include: {
                    farmer: { include: { user: true } },
                    crop: true,
                  },
                },
              },
            },
            orders: true,
          },
        },
      },
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    return requirement;
  }
}
