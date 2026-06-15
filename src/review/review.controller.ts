import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service.js';
import { CreateReviewDto } from './DTO/create-review.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import type { AuthRequest } from '../Types/authRequest.js';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Req() req : AuthRequest, @Body() dto: CreateReviewDto) {
    const userId = req.user.id; 
    return this.reviewService.createReview(userId, dto);
  }

  @Get('product/:productId')
  getReviews(@Param('productId') productId: number) {
    return this.reviewService.getByProduct(productId);
  }

  @Get('product/:productId/summary')
  getSummary(@Param('productId') productId: number) {
    return this.reviewService.getAverageRating(productId);
  }
}
