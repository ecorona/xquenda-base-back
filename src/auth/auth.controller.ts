import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { LoginResponseDTO } from './dto/login-response.dto';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';
import { JwtGuard } from './jwt/jwt.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDTO> {
    return this.authService.login(
      loginRequestDto.correo,
      loginRequestDto.contrasenia,
    );
  }

  @Get('perfil')
  @UseGuards(JwtGuard)
  async pefil(@Req() request: Request): Promise<UsuarioIdentityDTO> {
    const userIdentity: UsuarioIdentityDTO = {
      id: request['user'].id,
      nombreCompleto: request['user'].nombreCompleto,
      correo: request['user'].correo,
      activo: request['user'].activo,
      perfil: request['user'].perfil,
    };
    return userIdentity;
  }
}
