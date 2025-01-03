import { IsBoolean, IsOptional } from 'class-validator';

export class ListBookstoreDto {
  @IsOptional()
  @IsBoolean()
  dense: boolean = false;
}
