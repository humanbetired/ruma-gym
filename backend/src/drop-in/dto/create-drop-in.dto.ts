import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateDropInDto {
  @IsString()
  visitorName: string;

  @IsOptional()
  @IsString()
  visitorPhone?: string;

  @IsNumber()
  @Min(0)
  amount: number;
}