import { IsDateString } from 'class-validator';

export class FinancialReportQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}