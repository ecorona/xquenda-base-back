import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SyslogService } from './syslog.service';

@Controller('syslog')
export class SyslogController {
  constructor(private readonly syslogService: SyslogService) {}
  @Get()
  paginate(@Query() options): Promise<any> {
    return this.syslogService.paginate(options);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.syslogService.getById(id);
  }
}
