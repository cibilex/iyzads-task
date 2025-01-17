import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBookStoreDto {
  @IsString()
  @MinLength(4)
  @MaxLength(80)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(3)
  country: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  city: string;
}
