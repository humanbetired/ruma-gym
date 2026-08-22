import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Auth('ADMIN', 'OWNER')
  findAll(
    @Query('role') role?: RoleType,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll({
      role,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 5,
    });
  }

  @Patch(':id/role')
  @Auth('ADMIN', 'OWNER')
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() admin: { role: RoleType },
  ) {
    return this.usersService.updateRole(id, dto.role, admin.role);
  }

  @Get('me/kta')
  @Auth()
  getMyKta(@CurrentUser() user: { userId: string }) {
    return this.usersService.getMyKta(user.userId);
  }
}