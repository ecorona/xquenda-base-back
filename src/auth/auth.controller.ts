import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { LoginResponseDTO } from './dto/login-response.dto';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';
import { Public } from './jwt/public.decorator';
import { SesionUsuario } from './jwt/usuario-identity.decorator';
import { SyslogInclude } from 'src/syslog/interceptors/syslog-include.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @Public()
  @SyslogInclude('login', { body: true })
  login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDTO> {
    return this.authService.login(
      loginRequestDto.correo,
      loginRequestDto.contrasenia,
    );
  }

  @Get('perfil')
  async pefil(
    @SesionUsuario() userIdentity: UsuarioIdentityDTO,
  ): Promise<UsuarioIdentityDTO> {
    return userIdentity;
  }
}
