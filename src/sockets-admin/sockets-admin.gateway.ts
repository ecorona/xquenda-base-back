import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { SocketsAdminGuard } from './sockets-admin.guard';
import { Server } from 'socket.io';
import { SocketUser } from './socket-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { EventosAdmin } from './eventos-admin.enum';

@WebSocketGateway({
  transports: ['websocket'],
  path: '/admin',
})
@UseGuards(SocketsAdminGuard)
export class SocketsAdminGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(SocketsAdminGateway.name);
  afterInit() {
    this.logger.verbose('Sockets Gateway initialized');
  }
  handleConnection(client: SocketUser) {
    if (!client.handshake.auth.token) {
      client.emit('exception', new WsException('Token no proporcionado'));
      client.disconnect();
    }
    this.authService
      .validateToken(client.handshake.auth.token)
      .then((user) => {
        if (!user) {
          client.emit('exception', new WsException('Usuario no encontrado'));
          client.disconnect();
        }

        if (!user.activo) {
          client.emit('exception', new WsException('Usuario inactivo'));
          client.disconnect();
        }

        client.data = {
          user,
        };
        this.logger.log(
          `Client connected: ${client.id} - ${client.data.user.correo} (${client.data.user.perfil})`,
        );

        this.emit('todos', EventosAdmin.usuario_entrando, {
          correo: client.data.user.correo,
        });
      })
      .catch((error) => {
        this.logger.error(error);
        client.emit('exception', new WsException('Token inválido'));
        client.disconnect();
      });
  }

  handleDisconnect(client: SocketUser) {
    this.logger.log(
      `Client disconnected: ${client.id} ${client.data.user?.correo}`,
    );
    this.emit('todos', EventosAdmin.usuario_saliendo, {
      correo: client.data.user.correo,
    });
  }

  emit(channel: string, event: string, data: any): void {
    this.server.to(channel).emit(event, data);
  }

  @SubscribeMessage(EventosAdmin.canales)
  private async handleCanales(
    @ConnectedSocket() client: SocketUser,
  ): Promise<WsResponse<Array<string>>> {
    const canales = ['todos', client.data.user.perfil, client.data.user.correo];
    await client.join(canales);
    return {
      event: EventosAdmin.canales,
      //
      data: canales,
    };
  }

  @SubscribeMessage('mensaje')
  private handleMessage(
    @ConnectedSocket() client: SocketUser,
    @MessageBody() payload: { [key: string]: any },
  ): WsResponse<{ [key: string]: any }> {
    this.logger.log(`Client sent <mensaje>: ${JSON.stringify(payload)}`);
    return {
      event: 'mensaje', //responder con el mismo evento.
      data: {
        texto: `Mensaje recibido: ${payload.texto}`,
        data: payload.data,
      },
    };
  }
}
