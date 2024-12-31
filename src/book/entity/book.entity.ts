import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('books')
export class Book extends BaseEntity {
  @Index()
  @Column({
    type: 'varchar',
    length: '80',
  })
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'int',
    name: 'publication_date',
  })
  publicationDate: number;

  @Index()
  @Column()
  price: number;
}
