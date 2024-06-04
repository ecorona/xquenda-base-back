import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
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
import { IS_PROFILE_KEY } from './profile.decorator';
import { PerfilesEnum } from 'src/usuarios/dto/perfiles.enum';
import { Request } from 'express';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';

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

    const request: Request & { user: UsuarioIdentityDTO } = context
      .switchToHttp()
      .getRequest();
    const tokenValue = this.extractTokenFromHeader(request);
    if (!tokenValue) {
      throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
    }
    let payload: TokenPayloadDTO;
    try {
      payload = await this.jwtService.verifyAsync(tokenValue, {
        secret: this.configService.get<string>(ConfigKeys.JWT_SECRET),
      });
    } catch (error) {
      throw new UnauthorizedException(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
    }

    //validar que la solicitud provenga de la ip que se guardo en el token al momento del login
    const ipOrigen = request.ips ? request.ips[0] : request.ip;
    if (payload.ip !== ipOrigen) {
      throw new HttpException('Invalid token source', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.usuariosService.findById(payload.sub);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    if (!user.activo) {
      throw new HttpException('User is inactive', HttpStatus.UNAUTHORIZED);
    }

    //verificar si esta decorado para algun perfil
    const paraPerfiles = this.reflector.getAllAndOverride<Array<PerfilesEnum>>(
      IS_PROFILE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (paraPerfiles) {
      if (!paraPerfiles.includes(user.perfil)) {
        throw new HttpException(
          'User does not have the required profile: ' + paraPerfiles.join(', '),
          HttpStatus.FORBIDDEN,
        );
      }
    }

    request.user = await this.usuariosService.userIdentity(user);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
