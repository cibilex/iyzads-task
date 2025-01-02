import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('bookstores')
export class BookStore extends BaseEntity {
  @Index()
  @Column({
    type: 'varchar',
    length: '80',
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
