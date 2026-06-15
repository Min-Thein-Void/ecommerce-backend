import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';

interface UserDetail {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: UserDetail) {
    return this.authService.login(body.email, body.password);
  }
}
