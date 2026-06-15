import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { error } from 'console';
import { OrderStatus } from '../generated/prisma/enums.js';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto.js';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}
  async checkout(userId: number) {
    return this.prisma.$transaction(async (db) => {
      // 1. get cart with items + products
      const cart = await db.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      let total: number = 0;

      // 2. validate + prepare order items
      const orderItems: OrderItemDto[] = cart.items.map((item) => {
        const product = item.product;

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.id}`);
        }

        const price: number = product.price;
        total += price * item.quantity;

        return {
          productId: product.id,
          quantity: item.quantity,
          price,
        };
      });

      // 3. update stock
      await Promise.all(
        cart.items.map((item) =>
          db.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );

      // 4. create order
      const order: CreateOrderDto = await db.order.create({
        data: {
          userId,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 5. clear cart
      await db.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    });
  }

  async getOrders() {
    const orders: CreateOrderDto[] = await this.prisma.order.findMany({
      include: {
        items: true,
      },
    });
    return orders;
  }

  async getMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async orderStatusUpdate(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new error('order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: id },
      data: {
        status: status,
      },
    });

    return updatedOrder;
  }
}
