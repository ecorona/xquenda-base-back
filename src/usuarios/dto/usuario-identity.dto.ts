import { PerfilesEnum } from './perfiles.enum';

export class UsuarioIdentityDTO {
  id: number;
  nombreCompleto: string;
  correo: string;
  activo: boolean;
  perfil: PerfilesEnum;
}
