import { Module } from '@nestjs/common';
import { BookstoreController } from './bookstore.controller';
import { BookstoreService } from './bookstore.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookStore } from './entity/bookstore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookStore])],
  controllers: [BookstoreController],
  providers: [BookstoreService],
})
export class BookstoreModule {}
