import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateGalleryImageDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}