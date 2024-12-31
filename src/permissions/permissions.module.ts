import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entity/permission.entity';
import { PermissionItem } from 'src/permission-item/entity/permission-item.entity.dto';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, PermissionItem])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
