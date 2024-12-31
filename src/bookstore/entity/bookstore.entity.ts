import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class BookStore extends BaseEntity {
  @Index()
  @Column({
    type: 'varchar',
    length: '100',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 3,
  })
  country: string;

  @Column({
    type: 'varchar',
    length: '30',
  })
  city: string;
}
