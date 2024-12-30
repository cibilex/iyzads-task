import {
  Body,
  Controller,
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

  @Post()
  createPermission(@Body() body: CreatePermissionDto) {
    return this.permissionService.createPermission(body);
  }

  @Get()
  getPermissions() {
    return this.permissionService.getPermissions();
  }

  @Put(':id')
  updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreatePermissionDto,
  ) {
    return this.permissionService.updatePermission(id, body);
  }
}
