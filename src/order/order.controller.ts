import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { roles } from '../common/decorators/roles.decorator.js';
import type { AuthRequest } from '../Types/authRequest.js';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Req() req: AuthRequest) {
    return this.orderService.checkout(req.user.id);
  }

  @Get('all')
  getOrders() {
    return this.orderService.getOrders();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  orderStatusUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.orderStatusUpdate(id, dto.status);
  }

  @Get('byme')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Req() req: AuthRequest) {
    return this.orderService.getMyOrders(req.user.id);
  }
}
