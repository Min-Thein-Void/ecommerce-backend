import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from '../../Types/authRequest.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());

    // no roles → allow
    if (!roles) return true;

    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    return roles.includes(user.role);
  }
}
