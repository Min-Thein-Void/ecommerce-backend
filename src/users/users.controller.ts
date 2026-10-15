import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { roles } from '../common/decorators/roles.decorator.js';
import { getUser } from '../common/decorators/getUser.decorator.js';
import { GetUserDto } from './dto/get-user.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.js';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create')
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body.name, body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@getUser() user: GetUserDto) {
    return this.usersService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@getUser() user: GetUserDto, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/image')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  updateProfileImage(
    @getUser() user: GetUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateProfileImage(user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin')
  @roles('ADMIN')
  adminOnly() {
    return 'Only admin can access';
  }
}
