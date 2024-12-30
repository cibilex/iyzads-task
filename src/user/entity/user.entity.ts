import { BaseEntity } from 'src/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Setting } from './setting.entity';
import { Exclude, Transform } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  @Index({
    unique: true,
  })
  @Column({
    type: 'varchar',
    length: 50,
  })
  username: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 120,
    select: false,
  })
  password: string;

  @Column({
    type: 'smallint',
    name: 'birth_year',
  })
  birthYear: number;

  @OneToOne(() => Setting, (setting) => setting.user)
  setting: Setting;
}
