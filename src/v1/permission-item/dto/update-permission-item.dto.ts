import { PickType } from '@nestjs/swagger';
import { CreatePermissionItemDto } from './create-permission-item.dto';

export class UpdatePermissionItemDto extends PickType(CreatePermissionItemDto, [
  'priority',
]) {}
