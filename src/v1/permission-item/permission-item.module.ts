import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PermissionItemController } from './permission-item.controller';
import { PermissionItemService } from './permission-item.service';
import { PermissionItem } from './entity/permission-item.entity.dto';
import { Permission } from 'src/v1/permissions/entity/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionItem, Permission])],
  controllers: [PermissionItemController],
  providers: [PermissionItemService],
})
export class PermissionItemModule {}
