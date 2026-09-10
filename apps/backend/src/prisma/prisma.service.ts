import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn('DATABASE_URL is not set. Database operations will be skipped until configured.');
      return;
    }
    try {
      await this.$connect();
      this.logger.log('Prisma successfully connected to MySQL database.');
    } catch (error) {
      this.logger.error(
        `Failed to connect to MySQL database via Prisma: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database.');
  }

  /**
   * Health check utility to test active database connectivity
   */
  async isHealthy(): Promise<boolean> {
    if (!process.env.DATABASE_URL) {
      return false;
    }
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
