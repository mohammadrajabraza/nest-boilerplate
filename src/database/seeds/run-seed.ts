import '../../polyfill';
import { NestFactory } from '@nestjs/core';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { UserSeedService } from './user/user-seed.service';
import { CompanySeedService } from './company/company-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(CompanySeedService).run();
  await app.get(RoleSeedService).run();
  await app.get(UserSeedService).run();

  await app.close();
};

void runSeed();
