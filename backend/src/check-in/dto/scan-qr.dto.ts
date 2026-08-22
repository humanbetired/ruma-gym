import { IsString, IsNumber } from 'class-validator';

export class ScanQrDto {
  @IsString()
  token: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}