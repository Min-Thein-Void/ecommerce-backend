import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { roles } from '../common/decorators/roles.decorator.js';
import { getUser } from '../common/decorators/getUser.decorator.js';
import { getUserDto } from './dto/get-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create')
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@getUser() user : getUserDto) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin')
  @roles('ADMIN')
  adminOnly() {
    return 'Only admin can access';
  }
}
