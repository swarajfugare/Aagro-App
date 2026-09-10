import { Injectable, Logger } from '@nestjs/common';
import {
  OrderStatus,
  SupplyStatus,
  RequirementStatus,
  TripStatus,
  VerificationStatus,
  DriverStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    // If DATABASE_URL is not set or Prisma is offline, return resilient structure
    if (!process.env.DATABASE_URL) {
      return {
        metrics: {
          totalFarmers: 0,
          verifiedFarmers: 0,
          pendingFarmers: 0,
          totalBuyers: 0,
          verifiedBuyers: 0,
          totalDrivers: 0,
          activeDrivers: 0,
          totalCrops: 0,
          availableSupplyBatches: 0,
          openDemands: 0,
          activeOrders: 0,
          completedOrders: 0,
          activeTrips: 0,
        },
        supplyVsDemand: [],
        cropDistribution: [],
        recentOrders: [],
        recentActivity: [],
        alerts: [
          {
            id: 'alert-db',
            type: 'info',
            title: 'Database Setup Pending',
            message: 'Connect live MySQL database in DATABASE_URL to populate real-time supply chain records.',
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    try {
      const [
        totalFarmers,
        verifiedFarmers,
        pendingFarmers,
        totalBuyers,
        verifiedBuyers,
        totalDrivers,
        activeDrivers,
        totalCrops,
        availableSupplyBatches,
        openDemands,
        activeOrdersCount,
        completedOrdersCount,
        activeTripsCount,
        recentOrders,
        recentAudits,
        cropsSummary,
      ] = await Promise.all([
        this.prisma.farmer.count(),
        this.prisma.farmer.count({ where: { kycStatus: VerificationStatus.VERIFIED } }),
        this.prisma.farmer.count({ where: { kycStatus: VerificationStatus.PENDING } }),
        this.prisma.buyer.count(),
        this.prisma.buyer.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
        this.prisma.driver.count(),
        this.prisma.driver.count({ where: { status: DriverStatus.AVAILABLE } }),
        this.prisma.crop.count(),
        this.prisma.supplyBatch.count({ where: { status: SupplyStatus.AVAILABLE } }),
        this.prisma.buyerRequirement.count({ where: { status: RequirementStatus.OPEN } }),
        this.prisma.order.count({
          where: {
            status: {
              in: [
                OrderStatus.SUBMITTED,
                OrderStatus.MATCHED,
                OrderStatus.CONFIRMED,
                OrderStatus.DRIVER_ASSIGNED,
                OrderStatus.PICKUP_IN_PROGRESS,
                OrderStatus.IN_TRANSIT,
              ],
            },
          },
        }),
        this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
        this.prisma.trip.count({
          where: {
            status: {
              in: [TripStatus.ASSIGNED, TripStatus.ACCEPTED, TripStatus.IN_PROGRESS],
            },
          },
        }),
        this.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            buyer: { include: { user: { select: { fullName: true, phone: true } } } },
            orderItems: {
              include: {
                supplyBatch: { include: { crop: true } },
                farmer: { include: { user: { select: { fullName: true } } } },
              },
            },
          },
        }),
        this.prisma.auditLog.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { fullName: true, role: { select: { name: true } } } },
          },
        }),
        this.prisma.crop.findMany({
          take: 6,
          include: {
            _count: {
              select: {
                supplyBatches: true,
                buyerRequirements: true,
              },
            },
          },
        }),
      ]);

      const supplyVsDemand = cropsSummary.map((c) => ({
        crop: c.name,
        category: c.category,
        supplyCount: c._count.supplyBatches,
        demandCount: c._count.buyerRequirements,
      }));

      const cropDistribution = cropsSummary.map((c) => ({
        name: c.name,
        value: c._count.supplyBatches + c._count.buyerRequirements,
      }));

      const alerts = [];
      if (pendingFarmers > 0) {
        alerts.push({
          id: 'alert-farmers-pending',
          type: 'warning',
          title: 'Pending Farmer KYC Verifications',
          message: `${pendingFarmers} farmer application(s) awaiting administrative review.`,
          timestamp: new Date().toISOString(),
        });
      }
      if (openDemands > 0 && availableSupplyBatches > 0) {
        alerts.push({
          id: 'alert-matching-available',
          type: 'info',
          title: 'Matching Opportunities Available',
          message: `${openDemands} open buyer requirement(s) ready for supply matching.`,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        metrics: {
          totalFarmers,
          verifiedFarmers,
          pendingFarmers,
          totalBuyers,
          verifiedBuyers,
          totalDrivers,
          activeDrivers,
          totalCrops,
          availableSupplyBatches,
          openDemands,
          activeOrders: activeOrdersCount,
          completedOrders: completedOrdersCount,
          activeTrips: activeTripsCount,
        },
        supplyVsDemand,
        cropDistribution,
        recentOrders,
        recentActivity: recentAudits,
        alerts,
      };
    } catch (error) {
      this.logger.error(`Error fetching dashboard stats: ${error}`);
      return {
        metrics: {
          totalFarmers: 0,
          verifiedFarmers: 0,
          pendingFarmers: 0,
          totalBuyers: 0,
          verifiedBuyers: 0,
          totalDrivers: 0,
          activeDrivers: 0,
          totalCrops: 0,
          availableSupplyBatches: 0,
          openDemands: 0,
          activeOrders: 0,
          completedOrders: 0,
          activeTrips: 0,
        },
        supplyVsDemand: [],
        cropDistribution: [],
        recentOrders: [],
        recentActivity: [],
        alerts: [],
      };
    }
  }
}
