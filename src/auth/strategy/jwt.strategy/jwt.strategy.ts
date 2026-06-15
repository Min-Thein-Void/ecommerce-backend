import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
interface JwtPayload {
  sub: number;
  name: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secretKey123',
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      name: payload.name,
      role: payload.role,
    };
  }
}
