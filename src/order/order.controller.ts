import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { roles } from '../common/decorators/roles.decorator.js';
import type { AuthRequest } from '../Types/authRequest.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { FilterOrderDto } from './dto/filter-order.dto.js';

@Controller('orders') // ✅ plural (REST standard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 🛒 Checkout (Create Order)
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@Req() req: AuthRequest, @Body() dto: CheckoutDto) {
    return this.orderService.checkout(req.user.id, dto);
  }

  // 👤 Get My Orders
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Req() req: AuthRequest) {
    return this.orderService.getMyOrders(req.user.id);
  }

  // 🔄 Admin: Update Order Status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.status);
  }

  // search and filter orders
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  findOrders(@Query() query: FilterOrderDto) {
    return this.orderService.filterOrder(query.search ?? '');
  }

  // // 🧑‍💼 Admin: Get All Orders
  // @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @roles('ADMIN')
  // getAllOrders() {
  //   return this.orderService.getAllOrders();
  // }
}
