import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Not, Repository } from 'typeorm';
import { CommonTableStatuses } from 'src/typings/common';
import { GlobalException } from 'src/global/global.filter';
import { convertPrice, Response } from 'src/helpers/utils';
import { Book } from './entity/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { Inventory } from 'src/inventory/entity/inventory.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly entityManager: EntityManager,
  ) {}

  async list() {
    return this.bookRepository.find({
      where: {
        status: Not(CommonTableStatuses.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async create({ title, description, price }: CreateBookDto) {
    await this.throwIfExists({ title });
    const bookstore = await this.bookRepository.save(
      this.bookRepository.create({
        title,
        description,
        price: convertPrice(price),
      }),
    );
    return new Response(bookstore, 'success.created', {
      property: 'words.book',
    });
  }

  async delete(id: number) {
    await this.entityManager.transaction(async (trx) => {
      const res = await trx.update(
        Book,
        { id, status: Not(CommonTableStatuses.DELETED) },
        this.bookRepository.create({
          status: CommonTableStatuses.DELETED,
        }),
      );
      if (!res.affected) {
        throw new GlobalException('errors.not_found', {
          args: {
            property: 'words.book',
          },
        });
      }

      await trx.update(
        Inventory,
        {
          bookId: id,
          status: Not(CommonTableStatuses.DELETED),
        },
        trx.getRepository(Inventory).create({
          status: CommonTableStatuses.DELETED,
        }),
      );
    });

    return new Response(true, 'success.deleted', {
      property: 'words.book',
    });
  }

  private exists(where: FindOptionsWhere<Book>) {
    return this.bookRepository.existsBy({
      status: Not(CommonTableStatuses.DELETED),
      ...where,
    });
  }

  private async throwIfExists(where: FindOptionsWhere<Book>) {
    const exists = await this.exists(where);
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.book',
        },
      });
    }
  }
}
