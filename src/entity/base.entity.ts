import { toUnixTime } from 'src/helpers/date';
import { CommonTableStatuses } from 'src/typings/common';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({
    type: 'enum',
    default: CommonTableStatuses.ACTIVE,
    enum: CommonTableStatuses,
  })
  status: CommonTableStatuses;

  @Index()
  @Column({
    type: 'int',
    nullable: false,
    name: 'created_at',
  })
  createdAt: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: number;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = toUnixTime();
    this.updatedAt = toUnixTime();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = toUnixTime();
  }
}
