import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  async hash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hashed: string) {
    return await bcrypt.compare(password, hashed);
  }
}
