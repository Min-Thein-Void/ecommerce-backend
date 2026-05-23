import { Injectable } from '@nestjs/common';
import { AddToCartDto } from './dto/addToCart.dto.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  //helper function of addtocart(){}
  async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId : userId},
      });
    }

    return cart;
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cart: { userId },//relationship query
        productId: dto.productId,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
        },
      });
    }

    const cart = await this.getOrCreateCart(userId);

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }
}
