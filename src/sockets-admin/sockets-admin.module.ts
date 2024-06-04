import { Global, Module } from '@nestjs/common';
import { SocketsAdminGateway } from './sockets-admin.gateway';
import { AuthModule } from 'src/auth/auth.module';
@Global()
@Module({
  imports: [AuthModule],
  providers: [SocketsAdminGateway],
  exports: [SocketsAdminGateway],
})
export class SocketsAdminModule {}
