import { Injectable, BadRequestException, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'prisma/prisma.service';
import { QrService } from '../qr/qr.service';
import { calculateDistanceMeters } from '../common/utils/geo.util';
import { Cron, CronExpression } from '@nestjs/schedule'


const AUTO_CHECKOUT_AFTER_HOURS = 4;

@Injectable()
export class CheckInService {
  private readonly logger = new Logger(CheckInService.name);

  constructor(
    private prisma: PrismaService,
    private qrService: QrService,
    private eventEmitter: EventEmitter2,
  ) {}

  async scan(userId: string, dto: { token: string; latitude: number; longitude: number }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role === 'MEMBER') {
      const activeMembership = await this.prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE', endDate: { gte: new Date() } },
      });

      if (!activeMembership) {
        throw new ForbiddenException('Kamu belum punya membership aktif. Silakan daftar membership terlebih dahulu.');
      }
    }

    const tokenResult = await this.qrService.validateAndConsumeToken(dto.token);
    if (!tokenResult.valid) {
      throw new BadRequestException(tokenResult.reason);
    }

    const gymLat = Number(process.env.GYM_LATITUDE);
    const gymLon = Number(process.env.GYM_LONGITUDE);
    const maxRadius = Number(process.env.GYM_CHECKIN_RADIUS_METERS ?? 100);

    const distance = calculateDistanceMeters(gymLat, gymLon, dto.latitude, dto.longitude);

    if (distance > maxRadius) {
      throw new BadRequestException(
        `Kamu berada ${Math.round(distance)}m dari gym, di luar radius ${maxRadius}m yang diizinkan`,
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const openCheckIn = await this.prisma.checkInLog.findFirst({
      where: { userId, type: 'CHECK_IN', createdAt: { gte: todayStart } },
      orderBy: { createdAt: 'desc' },
    });

    const alreadyCheckedOutAfter = openCheckIn
      ? await this.prisma.checkInLog.findFirst({
          where: { userId, type: 'CHECK_OUT', createdAt: { gt: openCheckIn.createdAt } },
        })
      : null;

    const isCheckingOut = openCheckIn && !alreadyCheckedOutAfter;

    await this.qrService.markTokenUsed(tokenResult.qrToken.id);

    let log;

    if (isCheckingOut) {
      const durationMs = Date.now() - openCheckIn.createdAt.getTime();
      const durationMinutes = Math.round(durationMs / 60000);

      log = await this.prisma.checkInLog.create({
        data: {
          userId,
          qrTokenId: tokenResult.qrToken.id,
          type: 'CHECK_OUT',
          latitude: dto.latitude,
          longitude: dto.longitude,
          distanceMeters: distance,
          durationMinutes,
        },
        include: { user: { select: { fullName: true } } },
      });
    } else {
      log = await this.prisma.checkInLog.create({
        data: {
          userId,
          qrTokenId: tokenResult.qrToken.id,
          type: 'CHECK_IN',
          latitude: dto.latitude,
          longitude: dto.longitude,
          distanceMeters: distance,
        },
        include: { user: { select: { fullName: true } } },
      });
    }

    this.eventEmitter.emit('checkin.created', { log, userId });

    return log;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async autoCheckoutStaleSessions() {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - AUTO_CHECKOUT_AFTER_HOURS);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const staleCheckIns = await this.prisma.checkInLog.findMany({
      where: { type: 'CHECK_IN', createdAt: { gte: todayStart, lt: cutoffTime } },
    });

    if (staleCheckIns.length === 0) return;

    const userIds = staleCheckIns.map((c) => c.userId);
    const allCheckOutsToday = await this.prisma.checkInLog.findMany({
      where: {
        userId: { in: userIds },
        type: 'CHECK_OUT',
        createdAt: { gte: todayStart },
      },
      select: { userId: true, createdAt: true },
    });

    let processedCount = 0;

    for (const checkIn of staleCheckIns) {
      const hasCheckedOut = allCheckOutsToday.some(
        (co) => co.userId === checkIn.userId && co.createdAt > checkIn.createdAt,
      );

      if (hasCheckedOut) continue;

      const durationMs = Date.now() - checkIn.createdAt.getTime();
      const durationMinutes = Math.round(durationMs / 60000);

      const log = await this.prisma.checkInLog.create({
        data: { userId: checkIn.userId, type: 'CHECK_OUT', durationMinutes },
        include: { user: { select: { fullName: true } } },
      });

      this.eventEmitter.emit('checkin.created', { log, userId: checkIn.userId });
      processedCount++;
    }

    if (processedCount > 0) {
      this.logger.log(`Auto-checkout dijalankan untuk ${processedCount} sesi yang terlupa`);
    }
  }

    async findRecent(limit = 20) {
    return this.prisma.checkInLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } },
      },
    });
  }
}