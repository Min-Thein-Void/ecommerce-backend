import { IsNumber, IsString } from 'class-validator';

export class getUserDto {
  @IsNumber()
  id!: number;
  @IsString()
  role!: string;
}
