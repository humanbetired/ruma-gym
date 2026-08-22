import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [BullModule.registerQueue({
    name:'membership-reminder'
  })],
  providers: [MembershipsService],
  controllers: [MembershipsController],
  exports: [MembershipsService]
})

export class MembershipsModule {}