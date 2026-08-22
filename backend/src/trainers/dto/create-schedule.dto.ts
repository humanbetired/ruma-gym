import { IsDateString } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  date: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}