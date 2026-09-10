import { Injectable, NotFoundException } from '@nestjs/common';
import { TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: TripStatus, driverId?: string, skip = 0, take = 50) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0 };
    }

    const where: any = {};
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;

    const [items, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: { include: { user: { select: { fullName: true, phone: true } } } },
          vehicle: true,
          order: {
            include: { buyer: { include: { user: { select: { fullName: true, phone: true } } } } },
          },
          _count: {
            select: {
              tripStops: true,
              pickupRecords: true,
              deliveryRecords: true,
            },
          },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        driver: { include: { user: true, vehicles: true } },
        vehicle: true,
        order: {
          include: {
            buyer: { include: { user: true } },
            orderItems: { include: { supplyBatch: { include: { crop: true } }, farmer: { include: { user: true } } } },
          },
        },
        tripStops: {
          orderBy: { stopOrder: 'asc' },
          include: {
            pickupRecords: { include: { supplyBatch: { include: { crop: true } }, farmer: { include: { user: true } } } },
            deliveryRecords: { include: { buyer: { include: { user: true } }, proofOfDelivery: true } },
          },
        },
        routes: {
          include: { routePoints: { orderBy: { sequenceOrder: 'asc' } } },
        },
        driverLocations: {
          take: 20,
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }
}
