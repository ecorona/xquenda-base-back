import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { LoginResponseDTO } from './dto/login-response.dto';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';
import { Public } from './jwt/public.decorator';
import { SesionUsuario } from './jwt/usuario-identity.decorator';
import { SyslogInclude } from 'src/syslog/interceptors/syslog-include.decorator';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @SyslogInclude('login', { body: true })
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @Req() req: Request,
  ): Promise<LoginResponseDTO> {
    const userLoggedIn = await this.authService.login(
      loginRequestDto.correo,
      loginRequestDto.contrasenia,
      req.ips ? req.ips[0] : req.ip, //pasar la ip para almacenar en el token
    );

    return userLoggedIn;
  }

  @Get('perfil')
  @SkipThrottle()
  async pefil(
    @SesionUsuario() userIdentity: UsuarioIdentityDTO,
  ): Promise<UsuarioIdentityDTO> {
    return userIdentity;
  }
}
