import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { toUnixTime } from 'src/helpers/date';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: '11',
  })
  phone: string;

  @Index()
  @Column({
    type: 'varchar',
    length: '3',
  })
  country: string;

  @Column({
    type: 'int',
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: number;

  @BeforeInsert()
  beforeInsert() {
    this.updatedAt = toUnixTime();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = toUnixTime();
  }

  @Column({ nullable: false, name: 'user_id' })
  userId: number;

  @OneToOne(() => User, {})
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
