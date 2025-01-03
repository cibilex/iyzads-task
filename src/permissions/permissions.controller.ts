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
import { Auth } from 'src/public/public.decorator';

@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Auth(['permission.list'])
  @Get()
  getPermissions() {
    return this.permissionService.list(true);
  }

  @Auth(['permission.create'])
  @Post()
  createPermission(@Body() body: CreatePermissionDto) {
    return this.permissionService.create(body);
  }

  @Auth(['permission.update'])
  @Put(':id')
  updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, body);
  }

  @Auth(['permission.delete'])
  @Delete(':id')
  deletePermission(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.delete(id);
  }
}
