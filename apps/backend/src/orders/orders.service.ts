import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: OrderStatus, buyerId?: string, skip = 0, take = 50) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0 };
    }

    const where: any = {};
    if (status) where.status = status;
    if (buyerId) where.buyerId = buyerId;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { include: { user: { select: { fullName: true, phone: true } } } },
          orderItems: {
            include: {
              supplyBatch: { include: { crop: true } },
              farmer: { include: { user: { select: { fullName: true, phone: true } } } },
            },
          },
          trips: {
            include: {
              driver: { include: { user: { select: { fullName: true, phone: true } } } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          include: {
            user: true,
            village: { include: { district: { include: { state: true } } } },
          },
        },
        orderItems: {
          include: {
            supplyBatch: {
              include: {
                crop: true,
                variety: true,
                farmer: { include: { user: true, village: true } },
              },
            },
            farmer: { include: { user: true, village: true } },
          },
        },
        statusHistory: {
          include: { changedBy: { select: { fullName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        trips: {
          include: {
            driver: { include: { user: true } },
            vehicle: true,
            tripStops: true,
          },
        },
        deliveryRecords: {
          include: { proofOfDelivery: true },
        },
        invoices: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, toStatus: OrderStatus, changedByUserId?: string, reason?: string) {
    const current = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: toStatus,
          confirmedAt: toStatus === OrderStatus.CONFIRMED ? new Date() : current.confirmedAt,
          completedAt: toStatus === OrderStatus.COMPLETED ? new Date() : current.completedAt,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: current.status,
          toStatus,
          changedByUserId,
          reason,
        },
      });

      return updated;
    });
  }
}
