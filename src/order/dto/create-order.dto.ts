import { Type } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';

export class OrderItemDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  price!: number;
}

export class CreateOrderDto {
  @IsArray()
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
