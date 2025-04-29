import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
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

  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.profileSettingCreators)
  creator: UserEntity | null;

  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.profileSettingUpdators)
  updator: UserEntity | null;

  @JoinColumn({ name: 'deleted_by', referencedColumnName: 'id' })
  @ManyToOne(() => UserEntity, (user) => user.profileSettingDeletors)
  deletor: UserEntity | null;
}
