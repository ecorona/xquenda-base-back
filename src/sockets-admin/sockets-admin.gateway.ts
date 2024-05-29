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
  WsResponse,
} from '@nestjs/websockets';
import { SocketsAdminGuard } from './sockets-admin.guard';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  transports: ['websocket'],
})
@UseGuards(SocketsAdminGuard)
export class SocketsAdminGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;
  private readonly logger = new Logger(SocketsAdminGateway.name);
  afterInit() {
    this.logger.verbose('Sockets Gateway initialized');
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(
      `Client connected: ${client.id}||${client.handshake.query.token}||${JSON.stringify(args)}`,
    );
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emit(channel: string, event: string, data: any): void {
    this.server.to(channel).emit(event, data);
  }

  @SubscribeMessage('canales')
  private handleCanales(
    @ConnectedSocket() client: Socket,
  ): WsResponse<Array<string>> {
    this.logger.log(`Client sent <canales>`);
    const canales = ['todos'];

    client.join(canales);

    return {
      event: 'canales',
      data: canales,
    };
  }

  @SubscribeMessage('message')
  private handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): WsResponse<string> {
    this.logger.log(`Client sent <message>: ${JSON.stringify(payload)}`);
    return {
      event: 'message',
      data: payload,
    };
  }
}
