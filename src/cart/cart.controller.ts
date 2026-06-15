import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AddToCartDto } from './dto/addToCart.dto.js';
import { CartService } from './cart.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import type { AuthRequest } from '../Types/authRequest.js';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  addToCart(@Req() req: AuthRequest, @Body() dto: AddToCartDto) {
    console.log('DTO:', dto);
    return this.cartService.addToCart(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getCart(@Req() req: AuthRequest) {
    return this.cartService.getCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  clearCartById(@Req() req: AuthRequest){
    return this.cartService.clearCartById(req.user.id)
  }
}
