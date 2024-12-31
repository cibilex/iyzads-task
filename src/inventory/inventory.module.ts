import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entity/inventory.entity';
import { Book } from 'src/book/entity/book.entity';
import { BookStore } from 'src/bookstore/entity/bookstore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Book, BookStore])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
