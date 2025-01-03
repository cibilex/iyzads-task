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
import { PermissionItemService } from './permission-item.service';
import { CreatePermissionItemDto } from './dto/create-permission-item.dto';
import { UpdatePermissionItemDto } from './dto/update-permission-item.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/public/public.decorator';

@ApiBearerAuth()
@Controller('permission-item')
export class PermissionItemController {
  constructor(private readonly permissionItemService: PermissionItemService) {}

  @Auth(['permission.list'])
  @Get()
  getPermissions() {
    return this.permissionItemService.list();
  }

  @Auth(['permission.create'])
  @Post(':permissionId')
  createPermission(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Body() body: CreatePermissionItemDto,
  ) {
    return this.permissionItemService.create(permissionId, body);
  }

  @Auth(['permission.update'])
  @Put(':permissionId/:id')
  updatePermission(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePermissionItemDto,
  ) {
    return this.permissionItemService.update(permissionId, id, body);
  }

  @Auth(['permission.delete'])
  @Delete(':permissionId/:id')
  deletePermission(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.permissionItemService.delete(permissionId, id);
  }
}
