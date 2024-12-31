import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { Auth } from 'src/public/public.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Auth(['inventory.list'])
  @Get()
  list() {
    return this.inventoryService.list();
  }

  @Auth(['inventory.create'])
  @Post(':bookstore/:book')
  create(
    @Param('bookstore', ParseIntPipe) bookstoreId: number,
    @Param('book', ParseIntPipe) bookId: number,
    @Body() body: CreateInventoryDto,
  ) {
    return this.inventoryService.create(bookstoreId, bookId, body.quantity);
  }

  @Auth(['inventory.delete'])
  @Delete('/:bookstore/:book/:id')
  delete(
    @Param('bookstore', ParseIntPipe) bookstoreId: number,
    @Param('book', ParseIntPipe) bookId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.inventoryService.delete(bookstoreId, bookId, id);
  }

  @Auth(['inventory.updateQuantity'])
  @Put('/:bookstore/:book/:id')
  update(
    @Param('bookstore', ParseIntPipe) bookstoreId: number,
    @Param('book', ParseIntPipe) bookId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateInventoryDto,
  ) {
    return this.inventoryService.update(bookstoreId, bookId, id, body.quantity);
  }
}
