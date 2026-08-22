import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval, Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QrToken } from '@prisma/client';

const QR_ROTATE_INTERVAL_MS = 15_000; 
const QR_TOKEN_LIFETIME_MS = 20_000;

type TokenValidationResult =
  | { valid: true; qrToken: QrToken }
  | { valid: false; reason: string };

@Injectable()
export class QrService implements OnModuleInit {
  private readonly logger = new Logger(QrService.name);
  private currentToken: string | null = null;

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.rotateToken();
  }

  @Interval(QR_ROTATE_INTERVAL_MS)
  async rotateToken() {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + QR_TOKEN_LIFETIME_MS);

    await this.prisma.qrToken.create({
      data: { token, expiresAt },
    });

    this.currentToken = token;
    this.logger.debug(`QR token rotated: ${token}`);

    this.eventEmitter.emit('qr.rotated', {token});

    return token;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    const result = await this.prisma.qrToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (result.count > 0) {
      this.logger.debug(`Cleaned up ${result.count} expired QR tokens`);
    }
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }

  async validateAndConsumeToken(token: string) : Promise<TokenValidationResult> {
    const qrToken = await this.prisma.qrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      return { valid: false, reason: 'Token tidak ditemukan' };
    }

    if (qrToken.isUsed) {
      return { valid: false, reason: 'Token sudah pernah dipakai' };
    }

    if (qrToken.expiresAt < new Date()) {
      return { valid: false, reason: 'Token sudah kedaluwarsa' };
    }

    return { valid: true, qrToken };
  }

  async markTokenUsed(qrTokenId: string) {
    await this.prisma.qrToken.update({
      where: { id: qrTokenId },
      data: { isUsed: true },
    });
  }
}