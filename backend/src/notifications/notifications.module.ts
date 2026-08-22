import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MembershipReminderProcessor } from './processors/membership-reminder.processor';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'membership-reminder',
    }),
    PushModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, MembershipReminderProcessor],
  exports: [NotificationsService, BullModule],
})
export class NotificationsModule {}