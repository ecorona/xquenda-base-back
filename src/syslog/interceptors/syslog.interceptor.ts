import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SyslogService } from '../syslog.service';
import { Reflector } from '@nestjs/core';
import { SyslogMetaData } from './syslog-include.decorator';
import { SyslogEntity } from '../entity/syslog.entity';
import { SYSLOG_INCLUDE_METADATA_KEY } from '../dto/constants';
import { Response, Request } from 'express';
import { ConfigKeys } from 'src/config-keys.enum';
import { UsuarioIdentityDTO } from 'src/usuarios/dto/usuario-identity.dto';
/**
 * Intercepta todas las solicitudes que se hacen al sistema y se cuelga de la salida para generar
 * los logs del sistema.
 */
@Injectable()
export class SyslogInterceptor implements NestInterceptor {
  requestLogger = new Logger(SyslogInterceptor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly syslogService: SyslogService,
    private readonly reflector: Reflector,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    //primero verificamos si esta configurado para estar activo.
    if (!this.configService.get<boolean>(ConfigKeys.ENABLE_SYSLOG)) {
      return next.handle();
    }

    // obtener a la entrada para calcular el response-time
    const ahora = Date.now();

    //obtener la configuración de syslog para esta ruta
    //decorada
    const syslogMetadata = this.reflector.get<{
      event: string;
      meta: SyslogMetaData;
    }>(
      SYSLOG_INCLUDE_METADATA_KEY, //metadatos inyectados por el decorador @SyslogInclude a nivel metodo
      context.getHandler(), //metodo de clase
    );

    //si no se decoró este metodo de controller, no hacer nada.
    if (!syslogMetadata) {
      return next.handle();
    }

    //extraemos req y res del contexto(http)
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const { ip, method } = req;
    const originalUrl: string = req.originalUrl;
    //y nos colgamos al final
    return next.handle().pipe(
      tap(async (responseData) => {
        const resData = { ...responseData };
        const body = req.body;
        const userAgent: string = req.get('user-agent') || '';
        const { statusCode } = res;
        const date = new Date();
        const contentLength = Buffer.byteLength(JSON.stringify(resData));
        const responseTime = `${Date.now() - ahora}ms`;
        const referrer = req.headers.referer;
        const params = req.params;
        const query = req.query;
        //extraer un usuario de la solicitud, si es que existe
        //puesto ahí por JwtGuard al validar al usuario
        const usuario: UsuarioIdentityDTO = req['user'] ? req['user'] : null;

        //borrar datos sensibles
        delete body.password;
        delete resData.access_token;
        delete resData.accessToken;
        delete resData.jwt;
        //...etc

        const log = new SyslogEntity();
        //dependiendo de lo que el usuario haya decidido decorar...

        log.ip = syslogMetadata.meta.ip ? ip : undefined;
        //Aquí podriamos guardar el usuario también si es que viene en el request.user
        log.usuarioId =
          syslogMetadata.meta.usuario && usuario?.id ? usuario.id : undefined;
        log.userAgent = syslogMetadata.meta.userAgent
          ? userAgent.substring(0, 250)
          : undefined;
        log.body = syslogMetadata.meta.body && body ? body : undefined;
        log.baseUrl = syslogMetadata.meta.url ? originalUrl : undefined;
        log.responseData =
          syslogMetadata.meta.response && resData ? resData : undefined;
        log.params = syslogMetadata.meta.params && params ? params : undefined;

        log.query = syslogMetadata.meta.query && query ? query : undefined;

        //los que se van por defecto, es decir no son configurables.
        log.statusCode = res.statusCode;
        log.contentLength = contentLength;
        log.referrer = referrer;
        log.responseTime = responseTime;
        log.method = method;
        log.eventName = syslogMetadata.event.substring(0, 250);

        //almacenar el log en la base de datos.
        this.syslogService.storeLog(log);

        //mostrar en terminal
        const usuarioLog = usuario?.correo ? `${usuario.correo} ` : '';
        this.requestLogger.log(
          `${ip} ${date} ${usuarioLog}${method} ${statusCode} ${originalUrl} ${responseTime} ${userAgent}`,
        );
      }),
    );
  }
}
