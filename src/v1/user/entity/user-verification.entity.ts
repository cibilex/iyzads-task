import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_verifications')
export abstract class UserVerification extends BaseEntity {
  @Column({
    name: 'expired_at',
  })
  expiredAt: number;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  token: string;

  @Column({ type: 'boolean', name: 'remember_me', default: false })
  rememberMe: boolean;

  @Index()
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
