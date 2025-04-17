import { Injectable } from '@nestjs/common';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { UserEntity } from '@/modules/users/infrastructure/persistence/entities/user.entity';
import { HashingService } from '@/shared/services/hashing.service';

@Injectable()
@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(
    private readonly connection: Connection,
    private readonly hashingService: HashingService,
  ) {
    connection.subscribers.push(this); // <---- THIS
  }

  listenTo() {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>): Promise<void> {
    const user = event.entity;
    if (user.password) {
      user.password = await this.hashingService.hash(user.password);
    }
  }

  async beforeUpdate(event: UpdateEvent<UserEntity>): Promise<void> {
    const userEntity = event.entity;
    if (userEntity && userEntity.password) {
      userEntity.password = await this.hashingService.hash(userEntity.password);
    }
  }
}
