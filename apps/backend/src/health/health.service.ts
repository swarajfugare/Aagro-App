import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'unconfigured';
    firebase: 'configured' | 'unconfigured';
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const isDbConnected = await this.prismaService.isHealthy();
    const hasDbUrl = Boolean(process.env.DATABASE_URL);
    const isFirebaseReady = this.firebaseAdminService.isReady();

    const dbStatus = isDbConnected
      ? 'connected'
      : hasDbUrl
        ? 'disconnected'
        : 'unconfigured';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        firebase: isFirebaseReady ? 'configured' : 'unconfigured',
      },
    };
  }
}
