import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UseGuards, Get, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('test')
  createUser() {
    return this.usersService.create('zawzaw@gmail.com', '123456');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
