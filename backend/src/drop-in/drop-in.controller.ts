import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { DropInService } from './drop-in.service';
import { CreateDropInDto } from './dto/create-drop-in.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('drop-in')
@Auth('ADMIN', 'OWNER')
export class DropInController {
  constructor(private dropInService: DropInService) {}

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateDropInDto) {
    return this.dropInService.create(user.userId, dto);
  }

  @Patch(':id/checkout')
  checkout(@Param('id') id: string) {
    return this.dropInService.checkout(id);
  }

  @Get('today')
  findToday() {
    return this.dropInService.findToday();
  }

  @Get('stats/daily')
  getDailyRevenue(@Query('days') days?: string) {
  return this.dropInService.getDailyRevenue(days ? Number(days) : 7);
  }
  
  @Get()
  findAll(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dropInService.findAll(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

}