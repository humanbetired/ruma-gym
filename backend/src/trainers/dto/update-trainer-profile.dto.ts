import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTrainerProfileDto } from './create-trainer-profile.dto';

export class UpdateTrainerProfileDto extends PartialType(
  OmitType(CreateTrainerProfileDto, ['userId'] as const),
) {}