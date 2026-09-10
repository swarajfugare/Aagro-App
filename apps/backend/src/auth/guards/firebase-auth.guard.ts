import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAdminService } from '../../firebase/firebase-admin.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header. Expected Bearer token.');
    }

    const token = authHeader.substring(7);

    if (!this.firebaseAdminService.isReady()) {
      this.logger.warn('FirebaseAuthGuard called, but Firebase Admin SDK is not configured in this environment.');
      throw new UnauthorizedException('Authentication service is not configured on the server.');
    }

    try {
      const decodedToken = await this.firebaseAdminService.verifyIdToken(token);
      (request as any).user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phoneNumber: decodedToken.phone_number,
        firebaseToken: decodedToken,
      };
      return true;
    } catch (error) {
      this.logger.warn(`Firebase token verification failed: ${error instanceof Error ? error.message : error}`);
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }
}
