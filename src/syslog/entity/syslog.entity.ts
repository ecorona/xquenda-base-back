import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';
import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('syslog')
export class SyslogEntity {
  @PrimaryGeneratedColumn()
  id: number;
  //el usuario en sesión.
  @ManyToOne(() => UsuarioEntity, { nullable: true })
  usuario?: UsuarioEntity;

  @Column({ type: 'int', nullable: true })
  usuarioId?: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  method: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  baseUrl: string;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  statusCode: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  contentLength: number;

  @Column({
    type: 'varchar',
    length: 250,
    nullable: false,
  })
  userAgent: string;

  @Column({
    type: 'varchar',
    length: 39,
    nullable: false,
  })
  ip: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  body: any;

  @Column({
    type: 'json',
    nullable: true,
  })
  params: any;

  @Column({
    type: 'json',
    nullable: true,
  })
  query: any;

  @Column({
    type: 'tinytext',
    nullable: true,
  })
  referrer: string;

  @Column({
    type: 'tinytext',
    nullable: true,
  })
  responseTime: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  responseData: any;

  @Column({
    type: 'varchar',
    length: '250',
    nullable: true,
  })
  eventName: string;

  @CreateDateColumn()
  createdAt: Date;
}
