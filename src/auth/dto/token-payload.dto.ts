export class TokenPayloadDTO {
  sub: number; //id del usuario
  ip: string; //ip del usuario
  iat?: number; //issued at //fecha de emisión
  exp?: number; //expiration //fecha de expiración
}
