import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from "./prisma.service.js"; 
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductModule } from './product/product.module.js';
import { CategoryModule } from './category/category.module.js';
import { OrderModule } from './order/order.module.js';
import { CartModule } from './cart/cart.module.js';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, AuthModule, ProductModule, CategoryModule, OrderModule, CartModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
