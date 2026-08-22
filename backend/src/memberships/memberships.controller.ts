import { Controller, Post, Get, Patch, Param, Body, Delete } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('memberships')
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Get('plans')
  findAllPlans() {
    return this.membershipsService.findAllPlans();
  }

  @Get('plans/admin')
  @Auth('ADMIN', 'OWNER')
  findAllPlansAdmin() {
    return this.membershipsService.findAllPlansAdmin();
  }

  @Post('plans')
  @Auth('ADMIN', 'OWNER')
  createPlan(@Body() dto: CreatePlanDto) {
    return this.membershipsService.createPlan(dto);
  }

  @Patch('plans/:id')
  @Auth('ADMIN', 'OWNER')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.membershipsService.updatePlan(id, dto);
  }

  @Post()
  @Auth()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateMembershipDto) {
    return this.membershipsService.create(user.userId, dto.planId);
  }

  @Get('my')
  @Auth()
  findMy(@CurrentUser() user: { userId: string }) {
    return this.membershipsService.findMyMemberships(user.userId);
  }

    @Delete(':id')
    @Auth()
    cancelPending(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
      return this.membershipsService.cancelPending(id, user.userId);
    }
}