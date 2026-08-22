import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationsService } from '../notifications.service';
import { PushService } from '../../push/push.service';

interface MembershipReminderJobData {
  userId: string;
  membershipId: string;
  daysRemaining: number;
}

@Processor('membership-reminder')
export class MembershipReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(MembershipReminderProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    private pushService: PushService,
  ) {
    super();
  }

  async process(job: Job<MembershipReminderJobData>): Promise<void> {
    const { userId, daysRemaining } = job.data;

    const message = `Membership kamu akan berakhir dalam ${daysRemaining} hari. Segera perpanjang!`;

    await this.notificationsService.create(userId, 'MEMBERSHIP_EXPIRING', message);

    const pushResult = await this.pushService.sendToUser(userId, {
      title: 'Membership Segera Berakhir',
      body: message,
      url: '/membership',
    });

    this.logger.log(
      `Reminder terkirim untuk user ${userId} (in-app: ok, push: ${pushResult.sent} sukses, ${pushResult.failed} gagal)`,
    );
  }
}