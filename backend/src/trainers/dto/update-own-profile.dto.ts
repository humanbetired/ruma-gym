import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateOwnProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsUrl()
  tiktokUrl?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  whatsappUrl?: string;
}