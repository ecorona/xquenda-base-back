import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../dto/request-user.dto';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';
export const SesionUsuario = createParamDecorator(
  (data: any, ctx: ExecutionContext): UsuarioIdentityDTO => {
    const req: RequestUser = ctx.switchToHttp().getRequest();
    return req.user?.id ? req.user : null;
  },
);
