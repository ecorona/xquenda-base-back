import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from './usuarios/entities/usuario.entity';
import { AuthModule } from './auth/auth.module';
import { SocketsAdminModule } from './sockets-admin/sockets-admin.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigKeys } from './config-keys.enum';
import { ConfigValidation } from './config-validation';
import { SyslogEntity } from './syslog/entity/syslog.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigValidation,
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get(ConfigKeys.THROTTLER_TTL),
          limit: configService.get(ConfigKeys.THROTTLER_LIMIT),
        },
      ],
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get(ConfigKeys.DB_HOST),
          port: configService.get(ConfigKeys.DB_PORT),
          username: configService.get(ConfigKeys.DB_USERNAME),
          password: configService.get(ConfigKeys.DB_PASSWORD),
          database: configService.get(ConfigKeys.DB_DATABASE),
          entities: [UsuarioEntity, SyslogEntity],
          synchronize: true,
        };
      },
    }),
    UsuariosModule,
    AuthModule,
    SocketsAdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
