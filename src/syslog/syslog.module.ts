import { Global, Module } from '@nestjs/common';
import { SyslogService } from './syslog.service';
import { SyslogController } from './syslog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyslogEntity } from './entity/syslog.entity';
import { SyslogRepository } from './entity/syslog.repository';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SyslogEntity])],
  providers: [SyslogRepository, SyslogService],
  controllers: [SyslogController],
  exports: [SyslogService],
})
export class SyslogModule {}
