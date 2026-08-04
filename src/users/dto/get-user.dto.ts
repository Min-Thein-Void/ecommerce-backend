import { IsNumber, IsString } from 'class-validator';

export class GetUserDto {
  @IsNumber()
  id!: number;
  @IsString()
  role!: string;
}
