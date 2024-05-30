import { Request } from 'express';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';

export class RequestUser extends Request {
  user: UsuarioIdentityDTO;
}
