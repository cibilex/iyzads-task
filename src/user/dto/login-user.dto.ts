import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean } from 'class-validator';

export class LoginUserDto extends PickType(CreateUserDto, [
  'username',
  'password',
]) {
  @IsBoolean()
  rememberMe: boolean;
}
