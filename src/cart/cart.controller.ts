import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AddToCartDto } from './dto/addToCart.dto.js';
import { CartService } from './cart.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';

@Controller('cart')
export class CartController {
  constructor(private cartService : CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  addToCart(@Req() req,@Body() dto: AddToCartDto) {
    console.log("DTO:", dto);
    return this.cartService.addToCart(req.user.id,dto);
  }
}
