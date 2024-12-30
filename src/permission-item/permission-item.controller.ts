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
import { Public } from 'src/public/public.decorator';

@Public()
@Controller('permission-item')
export class PermissionItemController {
  constructor(private readonly permissionItemService: PermissionItemService) {}

  @Get()
  getPermissions() {
    return this.permissionItemService.getPermissions();
  }

  @Post(':permissionId')
  createPermission(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Body() body: CreatePermissionItemDto,
  ) {
    return this.permissionItemService.createPermission(permissionId, body);
  }

  @Put(':permissionId/:id')
  updatePermission(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreatePermissionItemDto,
  ) {
    return this.permissionItemService.updatePermission(permissionId, id, body);
  }

  @Delete(':permissionId/:id')
  deletePermission(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.permissionItemService.deletePermission(permissionId, id);
  }
}
