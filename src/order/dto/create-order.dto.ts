import { Type } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';

class OrderItemDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}