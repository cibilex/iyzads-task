import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BookstoreService } from './bookstore.service';
import { CreateBookStoreDto } from './dto/create-bookstore.dto';
import { Auth } from 'src/public/public.decorator';
import { ListBookstoreDto } from './dto/list-bookstore.dto';

@Controller('bookstore')
export class BookstoreController {
  constructor(private readonly bookStoreService: BookstoreService) {}

  @Auth(['bookstore.list'])
  @Get()
  list(@Query() query: ListBookstoreDto) {
    return this.bookStoreService.list(query.dense);
  }

  @Auth(['bookstore.create'])
  @Post()
  create(@Body() body: CreateBookStoreDto) {
    return this.bookStoreService.create(body);
  }

  @Auth(['bookstore.delete'])
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.bookStoreService.delete(id);
  }
}
