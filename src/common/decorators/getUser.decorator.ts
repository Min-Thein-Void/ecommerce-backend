import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequest } from '../../Types/authRequest.js';

export const getUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  },
);
