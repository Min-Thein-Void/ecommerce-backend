import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateProductDto } from '../../product/dto/create-product.dto.js';

@Injectable()
export class CustomPipe implements PipeTransform {
  transform(value: CreateProductDto) {
    if (!value) {
      throw new BadRequestException('Value is required');
    }
    return {
      ...value,
      name: value.name.toUpperCase(),
    };
  }
}
