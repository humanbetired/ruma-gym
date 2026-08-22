import { Module } from '@nestjs/common';
import { DropInService } from './drop-in.service';
import { DropInController } from './drop-in.controller';

@Module({
  providers: [DropInService],
  controllers: [DropInController],
})
export class DropInModule {}