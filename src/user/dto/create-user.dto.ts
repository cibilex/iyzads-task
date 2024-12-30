import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  username: string;

  @IsString()
  @MinLength(10)
  @MaxLength(32)
  password: string;

  @IsNumber()
  @Min(1900)
  @Max(2015)
  birthYear: number;

  @IsString()
  @MinLength(11)
  @MaxLength(11)
  phone: string;

  @IsString()
  @MinLength(2)
  @MaxLength(4)
  country: string;
}
