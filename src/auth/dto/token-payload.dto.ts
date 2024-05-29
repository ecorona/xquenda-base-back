export class TokenPayloadDTO {
  sub: number; //id del usuario
  iat?: number; //issued at //fecha de emisión
  exp?: number; //expiration //fecha de expiración
}
