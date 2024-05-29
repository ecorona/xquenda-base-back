import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginResponseDTO } from './dto/login-response.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDTO } from './dto/token-payload.dto';
import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}
  async login(correo: string, contrasenia: string): Promise<LoginResponseDTO> {
    const usuario = await this.usuariosService.findByEmail(correo);
    //ver si el usuario existe,
    if (!usuario) {
      throw new HttpException(
        'Credenciales no válidas',
        HttpStatus.UNAUTHORIZED,
      );
    }

    //si la contraseña es correcta
    if (usuario.contrasenia !== contrasenia) {
      throw new HttpException(
        'Credenciales no válidas',
        HttpStatus.UNAUTHORIZED,
      );
    }

    //este activo
    if (!usuario.activo) {
      throw new HttpException('Usuario inactivo', HttpStatus.FORBIDDEN);
    }

    //generar token
    const payload: TokenPayloadDTO = { sub: usuario.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
    };
  }

  async validateToken(token: string): Promise<UsuarioEntity> {
    try {
      const tokenPayload: TokenPayloadDTO = this.jwtService.verify(token);
      const usuario = await this.usuariosService.findById(tokenPayload.sub);
      if (!usuario) {
        throw new HttpException(
          'Usuario no encontrado',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return usuario;
    } catch (error) {
      throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
    }
  }
}
