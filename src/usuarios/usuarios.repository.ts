import { Repository } from 'typeorm';
import { UsuarioEntity } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class UsuariosRepository extends Repository<UsuarioEntity> {
  constructor(
    @InjectRepository(UsuarioEntity) repository: Repository<UsuarioEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findByEmail(correo: string): Promise<UsuarioEntity> {
    return this.findOne({ where: { correo: correo.toLowerCase() } });
  }

  findById(id: number): Promise<UsuarioEntity> {
    return this.findOne({ where: { id } });
  }

  findAll(): Promise<UsuarioEntity[]> {
    return this.find();
  }
}
