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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Get()
  getPermissions() {
    return this.permissionService.list(true);
  }

  @Post()
  createPermission(@Body() body: CreatePermissionDto) {
    return this.permissionService.create(body);
  }

  @Put(':id')
  updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, body);
  }

  @Delete(':id')
  deletePermission(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.delete(id);
  }
}
