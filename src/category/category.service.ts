import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: data.name,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        products: true,
      },
    });
  }
}
