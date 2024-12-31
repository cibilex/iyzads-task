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
import { Public } from 'src/public/public.decorator';

@Public(true)
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
    @Body() body: CreatePermissionDto,
  ) {
    return this.permissionService.update(id, body);
  }

  @Delete(':id')
  deletePermission(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.delete(id);
  }
}
