import { Module } from '@nestjs/common';
import { ReviewService } from './review.service.js';
import { ReviewController } from './review.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  providers: [ReviewService,PrismaService],
  controllers: [ReviewController]
})
export class ReviewModule {}
