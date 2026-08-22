import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TrainersService } from '../trainers/trainers.service';

@Controller('bookings')
export class BookingsController {
  constructor(
    private bookingsService: BookingsService,
    private trainersService: TrainersService,
  ) {}

  @Post()
  @Auth('MEMBER')
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.userId, dto);
  }

  @Get('my')
  @Auth('MEMBER')
  findMyBookings(@CurrentUser() user: { userId: string }) {
    return this.bookingsService.findMyBookingsAsMember(user.userId);
  }

   @Get('my/schedule')
  @Auth('MEMBER')
  findMyConfirmedSchedule(
    @CurrentUser() user: { userId: string },
    @Query() query: ScheduleQueryDto,
  ) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return this.bookingsService.findMyConfirmedSchedule(user.userId, from, to);
  }

  @Get('trainer/my')
  @Auth('PERSONAL_TRAINER')
  async findTrainerBookings(@CurrentUser() user: { userId: string }) {
    const trainer = await this.trainersService.findByUserId(user.userId);
    return this.bookingsService.findMyBookingsAsTrainer(trainer.id);
  }

  @Get('pending')
  @Auth('ADMIN', 'OWNER')
  findAllPending() {
    return this.bookingsService.findAllPending();
  }

  @Patch(':id/approve')
  @Auth('ADMIN', 'OWNER')
  approve(@Param('id') id: string, @CurrentUser() admin: { userId: string }) {
    return this.bookingsService.approve(id, admin.userId);
  }

  @Patch(':id/reject')
  @Auth('ADMIN', 'OWNER')
  reject(@Param('id') id: string, @CurrentUser() admin: { userId: string }) {
    return this.bookingsService.reject(id, admin.userId);
  }
}