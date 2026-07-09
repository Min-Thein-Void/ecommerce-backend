import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UpdateStockDto {
  @Type(() => Number)
  @IsInt()
  stockCount!: number;
}
