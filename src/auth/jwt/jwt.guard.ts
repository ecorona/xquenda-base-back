import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { ConfigKeys } from 'src/config-keys.enum';
import { IS_PUBLIC_KEY } from './public.decorator';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RequestUser } from '../dto/request-user.dto';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usuariosService: UsuariosService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request: RequestUser = context.switchToHttp().getRequest();
    const tokenValue = this.extractTokenFromHeader(request);
    if (!tokenValue) {
      throw new UnauthorizedException(new Error('Token not found'));
    }

    try {
      const payload: TokenPayloadDTO = await this.jwtService.verifyAsync(
        tokenValue,
        {
          secret: this.configService.get<string>(ConfigKeys.JWT_SECRET),
        },
      );

      const user = await this.usuariosService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException();
      }

      if (!user.activo) {
        throw new UnauthorizedException(new Error('User is not active'));
      }

      request.user = await this.usuariosService.userIdentity(user);
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        new Error(error.message || 'Invalid token'),
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
