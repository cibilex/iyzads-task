import { PickType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PickType(CreatePermissionDto, [
  'priority',
]) {}
