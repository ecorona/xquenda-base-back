import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  correo: string;
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  contrasenia: string;
}
