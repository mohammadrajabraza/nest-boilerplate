import { StrategyName } from '@/constants/strategy-name';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshGuard extends NestAuthGuard(StrategyName.JWT_REFRESH) {
  constructor() {
    super();
  }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
