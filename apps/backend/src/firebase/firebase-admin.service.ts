import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firebaseApp: admin.app.App | null = null;
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');
    const serviceAccountPath = this.configService.get<string>('firebase.serviceAccountPath');

    if (admin.apps.length > 0) {
      this.firebaseApp = admin.apps[0]!;
      this.isConfigured = true;
      return;
    }

    if (serviceAccountPath) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.isConfigured = true;
        this.logger.log('Firebase Admin SDK initialized from service account path.');
        return;
      } catch (error) {
        this.logger.error(`Failed to initialize Firebase Admin from serviceAccountPath: ${error}`);
      }
    }

    if (projectId && clientEmail && privateKey && !privateKey.includes('PLACEHOLDER')) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.isConfigured = true;
        this.logger.log('Firebase Admin SDK initialized successfully from environment credentials.');
        return;
      } catch (error) {
        this.logger.error(`Failed to initialize Firebase Admin SDK from environment variables: ${error}`);
      }
    }

    this.logger.warn(
      'Firebase Admin credentials not provided or placeholder values detected. Token verification will be simulated/inactive until valid credentials are configured.',
    );
  }

  /**
   * Check whether Firebase Admin SDK is configured with valid credentials
   */
  isReady(): boolean {
    return this.isConfigured && this.firebaseApp !== null;
  }

  /**
   * Verify Firebase ID Token provided by mobile/web client
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.isReady()) {
      throw new Error(
        'Firebase Admin SDK is not initialized. Please configure Firebase credentials in environment variables.',
      );
    }
    return admin.auth(this.firebaseApp!).verifyIdToken(idToken);
  }

  /**
   * Access Firebase Messaging instance for FCM notifications
   */
  getMessaging(): admin.messaging.Messaging {
    if (!this.isReady()) {
      throw new Error('Firebase Admin SDK is not initialized.');
    }
    return admin.messaging(this.firebaseApp!);
  }
}
