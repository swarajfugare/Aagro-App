import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BuyersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, status?: VerificationStatus, skip = 0, take = 50) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0 };
    }

    const where: any = {};
    if (status) {
      where.verificationStatus = status;
    }
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { phone: { contains: search } } },
        { user: { email: { contains: search } } },
        { gstNumber: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.buyer.findMany({
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
              requirements: true,
              orders: true,
            },
          },
        },
      }),
      this.prisma.buyer.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    if (!process.env.DATABASE_URL) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }

    const buyer = await this.prisma.buyer.findUnique({
      where: { id },
      include: {
        user: true,
        village: { include: { district: { include: { state: true } } } },
        requirements: {
          include: { crop: true, variety: true },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: { include: { supplyBatch: { include: { crop: true } } } },
          },
        },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }

    return buyer;
  }

  async updateVerification(id: string, verificationStatus: VerificationStatus) {
    return this.prisma.buyer.update({
      where: { id },
      data: { verificationStatus },
    });
  }
}
