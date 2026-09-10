import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              timestamp: new Date().toISOString(),
              uptimeSeconds: 10,
              environment: 'test',
              services: {
                database: 'connected',
                firebase: 'configured',
              },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status successfully', async () => {
    const result = await controller.getHealth();
    expect(result.success).toBe(true);
    expect(result.message).toBe('Service is healthy');
    expect(result.data.status).toBe('ok');
    expect(service.check).toHaveBeenCalled();
  });
});
