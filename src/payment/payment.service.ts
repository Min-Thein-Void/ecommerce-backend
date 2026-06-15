import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PaymentService {
  constructor(private Prisma: PrismaService) {}

  async createPayment(orderId: number) {
    const order = await this.Prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order Not Found.');
    }

    return this.Prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        provider: 'mock',
      },
    });
  }

  async confirmPayment(orderId: number) {
    // update payment
    await this.Prisma.payment.update({
      where: { orderId },
      data: { status: 'SUCCESS' },
    });

    // update order status
    return this.Prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });
  }
}
