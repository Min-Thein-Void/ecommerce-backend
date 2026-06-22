import { IsString } from 'class-validator';

export class CheckoutDto {
  @IsString()
  phone!: string;

  @IsString()
  address!: string;
}