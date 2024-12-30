import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(4)
  title: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}
