import { StrategyName } from '@/constants/strategy-name';
import { Injectable } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends NestAuthGuard(StrategyName.GOOGLE_OAUTH) {}
