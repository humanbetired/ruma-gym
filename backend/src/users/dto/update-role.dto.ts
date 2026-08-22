import { IsEnum } from 'class-validator';
import { RoleType } from '@prisma/client';

export class UpdateRoleDto {
  @IsEnum(RoleType)
  role: RoleType;
}