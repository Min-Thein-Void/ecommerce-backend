import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { OrderStatus } from '../generated/prisma/enums.js';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: number, dto: CheckoutDto) {
    const { phone, address } = dto;

    return this.prisma.$transaction(async (db) => {
      // 1. get cart
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
        throw new BadRequestException('Cart is empty');
      }

      let total = 0;

      // 2. validate & build order items
      const orderItems = cart.items.map((item) => {
        const product = item.product;

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for product ${product.name}`,
          );
        }

        const price = product.price;
        total += price * item.quantity;

        return {
          productId: product.id,
          quantity: item.quantity,
          price,
        };
      });

      // 3. update stock (important)
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
      const order = await db.order.create({
        data: {
          userId,
          total,
          phone,
          address,
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
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  async getMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
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

  async updateStatus(orderId: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
