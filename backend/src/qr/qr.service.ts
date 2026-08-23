import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';
import { QrToken } from '@prisma/client';

type TokenValidationResult =
  | { valid: true; qrToken: QrToken }
  | { valid: false; reason: string };

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);

  constructor(private prisma: PrismaService) {} 
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupInactiveTokens() {
    const result = await this.prisma.qrToken.deleteMany({
      where: { isUsed: false, createdAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) } },
    });

    if (result.count > 0) {
      this.logger.debug(`Cleaned up ${result.count} old unused QR tokens`);
    }
  }

  async validateToken(token: string): Promise<TokenValidationResult> {
    const qrToken = await this.prisma.qrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      return { valid: false, reason: 'QR code tidak dikenali' };
    }

    return { valid: true, qrToken };
  }
}