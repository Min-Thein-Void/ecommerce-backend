import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { PrismaService } from '../prisma.service.js';
import { error } from 'console';
import { OrderStatus } from '../generated/prisma/enums.js';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}
  async createOrder(userId: number, dto: CreateOrderDto) {
    //Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
    return this.prisma.$transaction(async (tx) => {
      const productIds = dto.items.map((item) => item.productId);

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      let total = 0;

      const orderItems = dto.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error('Not enough stock');
        }

        const price = product.price;
        total += price * item.quantity;

        return {
          productId: product.id,
          quantity: item.quantity,
          price,
        };
      });

      // stock update here
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // create order
      return tx.order.create({
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
    });
  }

  async getOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        items: true,
      },
    });
    return orders;
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
