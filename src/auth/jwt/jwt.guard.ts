import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.header('Authorization');

    if (!authorization) {
      throw new HttpException('Token no encontrado', HttpStatus.UNAUTHORIZED);
    }

    const [bearer, token] = authorization.split(' '); // 'Bearer token'
    if (bearer !== 'Bearer' || !token) {
      throw new HttpException('Token no válido', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.authService.validateToken(token);

    //adjuntar el usuario al request
    request['user'] = user;
    return true;
  }
}
