import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateReviewDto } from './DTO/create-review.dto.js';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: number, dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        productId: dto.productId,
        userId,
      },
    });
  }

  async getByProduct(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAverageRating(productId: number) {
    const result = await this.prisma.review.aggregate({
      where: {
        productId,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: result._avg.rating || 0,
      count: result._count.rating,
    };
  }
}
