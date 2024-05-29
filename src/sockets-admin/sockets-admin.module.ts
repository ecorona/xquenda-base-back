import { Module } from '@nestjs/common';
import { SocketsAdminGateway } from './sockets-admin.gateway';

@Module({
  providers: [SocketsAdminGateway],
  exports: [SocketsAdminGateway],
})
export class SocketsAdminModule {}
