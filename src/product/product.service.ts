import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { GetProductsDto } from './dto/get-product.dto.js';
import { Prisma } from '../generated/prisma/client.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

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
      where: {
        isDeleted: false,
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async productDetail(id: string) {
    if (!id) {
      throw new Error('id not found');
    }
    return this.prisma.product.findFirst({
      where: {
        id: Number(id),
        isDeleted: false,
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async editProduct(id: number, productData: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: productData,
    });
  }

  async destroyProduct(id: string) {
    return this.prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async searchProducts(query: GetProductsDto) {
    const { search, categoryId, price, minStock } = query;

    const where: Prisma.ProductWhereInput = {};

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
    if (price) {
      where.price = price;
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

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async increaseStock(productId: number, stockCount: number) {
    return await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          increment: stockCount,
        },
      },
      include: {
        category: true,
      },
    });
  }

  async decreaseStock(productId: number, stockCount: number) {
    return await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          decrement: stockCount,
        },
      },
      include: {
        category: true,
      },
    });
  }

  async productRecycleBin() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: true,
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async restoreProduct(productId: string) {
    return await this.prisma.product.update({
      where: {
        id: Number(productId),
      },
      data: {
        isDeleted: false,
      },
    });
  }
}
