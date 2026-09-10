import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'System Health Check', description: 'Returns application uptime and core service statuses.' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
    type: ApiResponseDto,
  })
  async getHealth() {
    const health = await this.healthService.check();
    return {
      success: true,
      data: health,
      message: 'Service is healthy',
    };
  }
}
