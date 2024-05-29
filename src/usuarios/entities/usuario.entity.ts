import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PerfilesEnum } from '../dto/perfiles.enum';

@Entity('usuarios')
export class UsuarioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombreCompleto: string;

  @Column()
  correo: string;

  @Column()
  contrasenia: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  activo: boolean;

  @Column({
    type: 'enum',
    enum: [PerfilesEnum.SUPER, PerfilesEnum.ADMIN, PerfilesEnum.USER],
    default: PerfilesEnum.USER,
  })
  perfil: PerfilesEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
