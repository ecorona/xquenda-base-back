import { SetMetadata } from '@nestjs/common';
import { PerfilesEnum } from 'src/usuarios/dto/perfiles.enum';

export const IS_PROFILE_KEY = 'isProfile';
export const IsProfile = (...perfiles: Array<PerfilesEnum>) =>
  SetMetadata(IS_PROFILE_KEY, perfiles);
