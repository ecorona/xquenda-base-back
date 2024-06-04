import { Module } from '@nestjs/common';
import { SyslogService } from './syslog.service';
import { SyslogController } from './syslog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyslogEntity } from './entity/syslog.entity';
import { SyslogRepository } from './entity/syslog.repository';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SyslogInterceptor } from './interceptors/syslog.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([SyslogEntity])],
  providers: [
    SyslogRepository,
    SyslogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SyslogInterceptor,
    },
  ],
  controllers: [SyslogController],
  exports: [SyslogService],
})
export class SyslogModule {}
