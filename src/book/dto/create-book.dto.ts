import {
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MaxLength(80)
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @IsInt()
  @Min(1)
  publicationDate: number;

  @IsNumber()
  @Min(0.1)
  price: number;
}
