import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true, description: 'Indicates whether the operation was successful' })
  success: boolean;

  @ApiPropertyOptional({ description: 'Response payload data' })
  data: T | null;

  @ApiProperty({ example: 'Operation completed successfully', description: 'Human-readable message' })
  message: string;

  @ApiPropertyOptional({ description: 'Optional error details when success is false' })
  error?: {
    code?: string;
    details?: any;
  };
}
