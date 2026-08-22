import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateTrainerProfileDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  specialty?: string;
}