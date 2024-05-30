import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { SocketUser } from './socket-user.dto';

@Injectable()
export class SocketsAdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: SocketUser = context.switchToWs().getClient();
    const token = client.handshake.auth.token;
    if (!token) {
      throw new WsException('Token no proporcionado');
    }
    try {
      const user = await this.authService.validateToken(token);
      if (!user) {
        throw new WsException('Usuario no encontrado');
      }

      //adjuntar el usuario a la data del cliente
      client.data = {
        user,
      };

      return true;
    } catch (error) {
      throw new WsException('Token inválido');
    }
  }
}
