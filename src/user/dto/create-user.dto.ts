import { IsObject, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  username: string;

  @IsString()
  @MinLength(10)
  @MaxLength(32)
  password: string;

  @IsObject()
  permissions: Record<string, number[]>;
}
