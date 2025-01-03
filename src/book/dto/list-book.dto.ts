import { IsBoolean, IsOptional } from 'class-validator';

export class ListBookDto {
  @IsOptional()
  @IsBoolean()
  dense: boolean = false;
}
