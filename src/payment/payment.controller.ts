import { Controller, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('order/:orderId/pay')
  pay(@Param('orderId') orderId: string) {
    return this.paymentService.createPayment(Number(orderId));
  }

  @Post('order/:orderId/confirm')
  confirm(@Param('orderId') orderId: string) {
    return this.paymentService.confirmPayment(Number(orderId));
  }
}
