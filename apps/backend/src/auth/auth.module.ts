import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { FirebaseModule } from '../firebase/firebase.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [FirebaseModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard, RolesGuard, PermissionsGuard],
  exports: [AuthService, FirebaseAuthGuard, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
