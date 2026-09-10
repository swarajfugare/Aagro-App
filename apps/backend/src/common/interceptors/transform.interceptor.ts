import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((response) => {
        // If the controller already returned an ApiResponseDto structure, pass it through
        if (
          response &&
          typeof response === 'object' &&
          'success' in response &&
          ('data' in response || 'message' in response)
        ) {
          return {
            success: response.success ?? true,
            data: response.data !== undefined ? response.data : null,
            message: response.message || 'Operation successful',
          };
        }

        return {
          success: true,
          data: response !== undefined ? response : null,
          message: 'Operation successful',
        };
      }),
    );
  }
}
