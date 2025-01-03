import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePermissionItemDto {
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  title: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}
