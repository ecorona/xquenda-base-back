import { Socket } from 'socket.io';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';
export class SocketUser extends Socket {
  data: {
    user: UsuarioIdentityDTO;
  };
}
