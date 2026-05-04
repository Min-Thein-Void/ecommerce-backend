import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategy/jwt.strategy/jwt.strategy.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'secretKey123', // later move to env
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService,JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}