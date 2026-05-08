import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { GetProductsDto } from './dto/get-product.dto.js';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async getProducts() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }

  async editProduct(id: string, productData: CreateProductDto) {
    return this.prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        ...productData,
      },
    });
  }

  async destroyProduct(id: string) {
    return this.prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
  }

  async findAll(query: GetProductsDto) {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      minStock,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // price range
    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) {
        where.price.gte = minPrice;
      }

      if (maxPrice) {
        where.price.lte = maxPrice;
      }
    }

    // stock filter
    if (minStock) {
      where.stock = {
        gte: minStock,
      };
    }

    return this.prisma.product.findMany({
      where,

      include: {
        category: true,
      },

      skip: (page - 1) * limit,
      take: limit,

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
