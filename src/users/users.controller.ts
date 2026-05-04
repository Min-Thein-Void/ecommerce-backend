
import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users') 
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('test')
  createUser() {
    return this.usersService.create('zawzaw@gmail.com', '123456');
  }
}