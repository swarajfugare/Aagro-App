import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header. Expected Bearer token.');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException('Authentication token cannot be empty.');
    }

    // 1. Verify token with Firebase Admin SDK
    const decodedToken = await this.authService.verifyFirebaseToken(token);

    // 2. Load application user, role, and permissions from MySQL
    const authenticatedUser = await this.authService.getAuthenticatedUser(decodedToken.uid);

    // 3. Attach authenticated user context to request
    (request as any).user = authenticatedUser;

    return true;
  }
}
