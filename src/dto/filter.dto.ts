import { IsInt, Max, Min } from 'class-validator';

export class FilterDto {
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 10;

  @IsInt()
  @Min(1)
  @Max(20)
  page = 1;
}
