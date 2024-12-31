import { PickType } from '@nestjs/mapped-types';
import { CreatePermissionItemDto } from './create-permission-item.dto';

export class UpdatePermissionItemDto extends PickType(CreatePermissionItemDto, [
  'priority',
]) {}
