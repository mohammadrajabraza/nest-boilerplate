// current-session.decorator.ts
import type { CustomRequest } from '@/types/jwt';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const CurrentSession = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<CustomRequest>();
  return request.user.session;
});
