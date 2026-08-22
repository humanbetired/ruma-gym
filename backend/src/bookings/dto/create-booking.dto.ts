import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  scheduleId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}