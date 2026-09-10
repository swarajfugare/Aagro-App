import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  /**
   * Validates and verifies an incoming Firebase ID token
   */
  async verifyFirebaseToken(idToken: string) {
    return this.firebaseAdminService.verifyIdToken(idToken);
  }
}
