import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { log } from 'console';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() dto: CreateOrderDto) {
    log(req.user.id)
    return this.orderService.createOrder(req.user.id, dto);
  }
}
