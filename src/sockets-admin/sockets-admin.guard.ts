import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class SocketsAdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;
    if (!token) {
      return false;
    }
    const user = await this.authService.validateToken(token);
    if (!user) {
      return false;
    }

    //adjuntar el usuario a la data del cliente
    client.data = {
      user,
    };

    return true;
  }
}
