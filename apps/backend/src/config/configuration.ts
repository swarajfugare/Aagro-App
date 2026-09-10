export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  baseUrl: string;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  url?: string;
}

export interface FirebaseConfig {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  serviceAccountPath?: string;
}

export interface StorageConfig {
  uploadPath: string;
  maxFileSizeMb: number;
}

export interface MapsConfig {
  tileProvider: string;
  routingProvider: string;
  routingApiKey?: string;
}

export interface ExternalServicesConfig {
  weatherApiKey?: string;
  marketPriceApiKey?: string;
}

export interface RootConfig {
  app: AppConfig;
  database: DatabaseConfig;
  firebase: FirebaseConfig;
  storage: StorageConfig;
  maps: MapsConfig;
  external: ExternalServicesConfig;
}

export default (): RootConfig => {
  const corsOriginsRaw = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000';
  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    app: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT || '3000', 10),
      apiPrefix: process.env.API_PREFIX || 'api/v1',
      baseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
      corsOrigins: corsOrigins.length > 0 ? corsOrigins : ['*'],
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    },
    storage: {
      uploadPath: process.env.FILE_STORAGE_PATH || './uploads',
      maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    },
    maps: {
      tileProvider: process.env.MAP_TILE_PROVIDER || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      routingProvider: process.env.ROUTING_PROVIDER || 'openrouteservice',
      routingApiKey: process.env.ROUTING_API_KEY,
    },
    external: {
      weatherApiKey: process.env.WEATHER_API_KEY,
      marketPriceApiKey: process.env.MARKET_PRICE_API_KEY,
    },
  };
};
