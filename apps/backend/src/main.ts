import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', ['*']);

  // Security Headers via Helmet
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: corsOrigins.includes('*') ? '*' : corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix for API Versioning
  app.setGlobalPrefix(apiPrefix);

  // Global Request Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Envelope and Logging Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Agriculture Supply Chain Platform API')
    .setDescription(
      'Shared REST API backend for Farmers, Drivers, Buyers, and Admin Panel applications.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter Firebase ID Token',
        in: 'header',
      },
      'firebase-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Agri Supply Chain API Documentation',
  });

  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(`🚀 Agriculture Supply Chain API running in ${nodeEnv} mode`);
  logger.log(`🌐 Base URL:        http://localhost:${port}/${apiPrefix}`);
  logger.log(`📄 API Swagger Doc: http://localhost:${port}/api/docs`);
  logger.log(`❤️  Health Check:    http://localhost:${port}/${apiPrefix}/health`);
  logger.log(`=======================================================`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during application bootstrap:', err);
  process.exit(1);
});
