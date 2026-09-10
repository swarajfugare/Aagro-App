import { Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, status?: DriverStatus, skip = 0, take = 50) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0 };
    }

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { licenseNumber: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.driver.findMany({
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
          vehicles: true,
          trips: {
            where: { status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] } },
            take: 1,
          },
          _count: {
            select: {
              trips: true,
              vehicles: true,
            },
          },
        },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: true,
        vehicles: true,
        trips: {
          orderBy: { createdAt: 'desc' },
          include: {
            vehicle: true,
            order: true,
          },
        },
        driverDocuments: true,
        driverLocations: {
          take: 10,
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async updateVerification(id: string, verificationStatus: VerificationStatus) {
    return this.prisma.driver.update({
      where: { id },
      data: { verificationStatus },
    });
  }
}
