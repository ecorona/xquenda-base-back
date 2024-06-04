import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from './config-keys.enum';
import * as compression from 'compression';
import helmet from 'helmet';
import { SyslogInterceptor } from './syslog/interceptors/syslog.interceptor';
import { SyslogService } from './syslog/syslog.service';
async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  const configService = app.get(ConfigService);
  const syslogService = app.get(SyslogService);
  app.use(compression());
  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>(ConfigKeys.CORS_ORIGIN),
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(
    new SyslogInterceptor(configService, syslogService, new Reflector()),
  );
  app.setGlobalPrefix(configService.get<string>(ConfigKeys.APP_PREFIX));
  await app.listen(configService.get<number>(ConfigKeys.PORT));
}
bootstrap();
