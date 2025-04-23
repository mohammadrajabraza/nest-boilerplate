import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '@/common/abstract.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'profile_settings' })
export class ProfileSettingEntity extends AbstractEntity {
  @Column({ nullable: true, type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true, type: 'boolean', default: true })
  isPasswordReset: boolean;

  @Column({ nullable: false, type: 'uuid', unique: true })
  userId: string;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'profile_setting_user_fkey',
  })
  @OneToOne(() => UserEntity, (user) => user.profileSetting)
  user: UserEntity;
}
