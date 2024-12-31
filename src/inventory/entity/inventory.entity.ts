import { Book } from 'src/book/entity/book.entity';
import { BookStore } from 'src/bookstore/entity/bookstore.entity';
import { BaseEntity } from 'src/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('inventories')
export class Inventory extends BaseEntity {
  @Index()
  @Column()
  quantity: number;

  @Column({
    nullable: false,
    name: 'book_id',
  })
  bookId: number;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Partial<Book>;

  @Column({
    nullable: false,
    name: 'bookstore_id',
  })
  bookstoreId: number;

  @ManyToOne(() => BookStore)
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: Partial<Inventory>;
}
