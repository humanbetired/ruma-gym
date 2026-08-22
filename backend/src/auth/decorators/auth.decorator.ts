import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Auth(...roles: RoleType[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
}