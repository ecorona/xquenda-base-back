import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { SyslogInclude } from 'src/syslog/interceptors/syslog-include.decorator';
import { PerfilesEnum } from './dto/perfiles.enum';
import { IsProfile } from 'src/auth/jwt/profile.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @IsProfile(PerfilesEnum.SUPER, PerfilesEnum.ADMIN)
  @SyslogInclude('Crear usuario')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  @SyslogInclude('Modificar usuario')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @SyslogInclude('Borrar usuario')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
