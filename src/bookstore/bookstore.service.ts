import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookStore } from './entity/bookstore.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { CreateBookStoreDto } from './dto/create-bookstore.dto';
import { CommonTableStatuses } from 'src/typings/common';
import { GlobalException } from 'src/global/global.filter';
import { Response } from 'src/helpers/utils';

@Injectable()
export class BookstoreService {
  constructor(
    @InjectRepository(BookStore)
    private readonly bookStoreRepository: Repository<BookStore>,
  ) {}

  async list() {
    return this.bookStoreRepository.find({
      where: {
        status: Not(CommonTableStatuses.DELETED),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async create({ title, country, city }: CreateBookStoreDto) {
    await this.throwIfExists({ title });
    const bookstore = await this.bookStoreRepository.save(
      this.bookStoreRepository.create({
        title,
        country,
        city,
      }),
    );
    return new Response(bookstore, 'success.created', {
      property: 'words.bookstore',
    });
  }

  async delete(id: number) {
    const result = await this.bookStoreRepository.update(
      { id, status: Not(CommonTableStatuses.DELETED) },
      this.bookStoreRepository.create({
        status: CommonTableStatuses.DELETED,
      }),
    );
    if (!result.affected) {
      throw new GlobalException('errors.not_found', {
        args: {
          property: 'words.bookstore',
        },
      });
    }
    // delete books

    return new Response(true, 'success.deleted', {
      property: 'words.bookstore',
    });
  }

  private exists(where: FindOptionsWhere<BookStore>) {
    return this.bookStoreRepository.existsBy({
      status: Not(CommonTableStatuses.DELETED),
      ...where,
    });
  }

  private async throwIfExists(where: FindOptionsWhere<BookStore>) {
    const exists = await this.exists(where);
    if (exists) {
      throw new GlobalException('errors.already_exists', {
        args: {
          property: 'words.permission_page',
        },
      });
    }
  }
}
