import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Auth } from 'src/public/public.decorator';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Auth(['book.list'])
  @Get()
  list() {
    return this.bookService.list();
  }

  @Auth(['book.create'])
  @Post()
  create(@Body() body: CreateBookDto) {
    return this.bookService.create(body);
  }

  @Auth(['book.delete'])
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.delete(id);
  }
}
