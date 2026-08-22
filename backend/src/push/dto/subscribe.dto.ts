import { IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PushKeysDto {
  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}

export class SubscribeDto {
  @IsUrl()
  endpoint: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}