import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { roles } from '../common/decorators/roles.decorator.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  getRevenue() {
    return this.adminService.getRevenue();
  }

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
