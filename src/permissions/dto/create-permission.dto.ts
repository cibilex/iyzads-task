import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(4)
  title: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}
