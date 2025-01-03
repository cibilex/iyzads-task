import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PermissionItemModule } from './permission-item/permission-item.module';
import { BookstoreModule } from './bookstore/bookstore.module';
import { BookModule } from './book/book.module';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    UserModule,
    PermissionsModule,
    PermissionItemModule,
    BookstoreModule,
    BookModule,
    InventoryModule,
  ],
})
export class V1Module {}
