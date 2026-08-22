import { IsString, IsInt, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ptSessionQuota?: number;
}