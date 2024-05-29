import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from './usuarios/entities/usuario.entity';
import { AuthModule } from './auth/auth.module';
import { SocketsAdminModule } from './sockets-admin/sockets-admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'rootpassword',
      database: 'tutorial',
      entities: [UsuarioEntity],
      synchronize: true,
    }),
    UsuariosModule,
    AuthModule,
    SocketsAdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
