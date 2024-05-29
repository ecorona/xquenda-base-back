import { Module, OnModuleInit } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from './entities/usuario.entity';
import { UsuariosRepository } from './usuarios.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity])],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosRepository],
  exports: [UsuariosService],
})
export class UsuariosModule implements OnModuleInit {
  constructor(private readonly usuariosService: UsuariosService) {}
  async onModuleInit() {
    //crear el primer usuario PerfilesEnum.SUPER si no existe
    await this.usuariosService.crearPrimerUsuario();
  }
}
