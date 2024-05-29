import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from './config-keys.enum';
import * as compression from 'compression';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
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
  app.setGlobalPrefix(configService.get<string>(ConfigKeys.APP_PREFIX));
  await app.listen(configService.get<number>(ConfigKeys.PORT));
}
bootstrap();
