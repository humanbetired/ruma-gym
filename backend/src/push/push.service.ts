import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as webpush from 'web-push';


@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
      throw new Error('VAPID keys belum lengkap di .env');
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  async subscribe(userId: string, dto: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: { userId, p256dh: dto.keys.p256dh, auth: dto.keys.auth },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
    });
  }

  async unsubscribe(endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
    });
  }

  async removeSubscription(endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  async sendToUser(userId: string, payload: { title: string; body: string; url?: string }) {
    const subscriptions = await this.findByUserId(userId);

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
        sent++;
      } catch (error: any) {
        failed++;

        if (error.statusCode === 404 || error.statusCode === 410) {
          this.logger.warn(`Subscription expired, menghapus: ${sub.endpoint}`);
          await this.removeSubscription(sub.endpoint);
        } else {
          this.logger.error(`Gagal kirim push ke ${sub.endpoint}: ${error.message}`);
        }
      }
    }

    return { sent, failed };
  }
}