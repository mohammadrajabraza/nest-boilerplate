import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthAuditLogService } from '@/modules/auth-audit-logs/auth-audit-log.service';
import { AuthAuditLogEvent } from '@/constants/auth-audit-log-event';
import { CustomRequest } from '@/types/jwt';
import * as requestIp from 'request-ip';

function CreateAuthAuditInterceptor(
  events: Record<'success' | 'error', AuthAuditLogEvent>,
) {
  @Injectable()
  class AuthAuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuthAuditLogService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { method, url, body: reqBody, user } = request as CustomRequest;

      const ipAddress = request.clientIp || requestIp.getClientIp(request);

      const deviceInfo = request.headers['user-agent'];
      const userId = user?.user?.id || undefined;

      return next.handle().pipe(
        tap(async (responseData) => {
          await this.auditService.createAuthAuditLog({
            eventType: events.success,
            ipAddress,
            deviceInfo,
            userId: userId || responseData?.data?.user?.id,
            body: JSON.stringify(reqBody),
            response: JSON.stringify(responseData),
          });
        }),
        catchError((err) => {
          Logger.error(`❌ Error - ${method} ${url}: ${err.message}`);

          // Still store the failed attempt
          this.auditService
            .createAuthAuditLog({
              eventType: events.error,
              ipAddress,
              deviceInfo,
              userId,
              body: JSON.stringify(reqBody),
              response: JSON.stringify({
                error: err.message,
                stack: err.stack,
              }),
            })
            .catch((logErr) =>
              Logger.error(`❌ Failed to log auth audit: ${logErr.message}`),
            );

          return throwError(() => err); // rethrow the original error
        }),
      );
    }
  }

  return AuthAuditInterceptor;
}

export const UseAuthAuditInterceptor = (
  events: Record<'success' | 'error', AuthAuditLogEvent>,
) => {
  return UseInterceptors(CreateAuthAuditInterceptor(events));
};
