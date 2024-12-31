import { Global, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CommonTableStatuses } from 'src/typings/common';
import { GlobalException } from 'src/global/global.filter';
import { convertPrice, Response } from 'src/helpers/utils';
import { Inventory } from './entity/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { Book } from 'src/book/entity/book.entity';
import { BookStore } from 'src/bookstore/entity/bookstore.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookStore)
    private readonly bookstoreRepository: Repository<BookStore>,
  ) {}

  async list() {
    return this.inventoryRepository.find({
      where: {
        status: Not(CommonTableStatuses.DELETED),
        bookstore: {
          status: Not(CommonTableStatuses.DELETED),
        },
        book: {
          status: Not(CommonTableStatuses.DELETED),
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        bookstore: true,
        book: true,
      },
    });
  }

  async create(bookstoreId: number, bookId: number, quantity: number) {
    await Promise.all([
      this.checkBookstore(bookstoreId),
      this.checkBook(bookId),
    ]);

    await this.throwIfExists({ bookstoreId, bookId });
    const bookstore = await this.inventoryRepository.save(
      this.inventoryRepository.create({
        bookstoreId,
        bookId,
        quantity,
      }),
    );

    return new Response(bookstore, 'success.created', {
      property: 'words.inventory',
    });
  }

  async update(
    bookstoreId: number,
    bookId: number,
    id: number,
    quantity: number,
  ) {
    await Promise.all([
      this.checkBookstore(bookstoreId),
      this.checkBook(bookId),
    ]);

    const result = await this.inventoryRepository.update(
      { bookstoreId, bookId, id, status: Not(CommonTableStatuses.DELETED) },
      this.inventoryRepository.create({
        quantity,
      }),
    );
    if (!result.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.inventory',
        },
      });
    }

    return new Response(true, 'success.deleted', {
      property: 'words.book',
    });
  }

  async delete(bookstoreId: number, bookId: number, id: number) {
    await Promise.all([
      this.checkBookstore(bookstoreId),
      this.checkBook(bookId),
    ]);
    const result = await this.inventoryRepository.update(
      { bookstoreId, bookId, id, status: Not(CommonTableStatuses.DELETED) },
      this.inventoryRepository.create({
        status: CommonTableStatuses.DELETED,
      }),
    );
    if (!result.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.inventory',
        },
      });
    }

    return new Response(true, 'success.deleted', {
      property: 'words.book',
    });
  }

  private async checkBook(id: number) {
    const exists = await this.bookRepository.existsBy({
      id,
      status: Not(CommonTableStatuses.DELETED),
    });
    if (!exists) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.book',
        },
      });
    }
  }
  private async checkBookstore(id: number) {
    const exists = await this.bookstoreRepository.existsBy({
      id,
      status: Not(CommonTableStatuses.DELETED),
    });

    if (!exists) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.bookstore',
        },
      });
    }
  }

  private exists(where: FindOptionsWhere<Inventory>) {
    return this.inventoryRepository.existsBy({
      status: Not(CommonTableStatuses.DELETED),
      ...where,
    });
  }

  private async throwIfExists(where: FindOptionsWhere<Inventory>) {
    const exists = await this.exists(where);
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.inventory',
        },
      });
    }
  }
}
