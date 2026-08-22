import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TrainersModule } from '../trainers/trainers.module';

@Module({
  imports: [TrainersModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}