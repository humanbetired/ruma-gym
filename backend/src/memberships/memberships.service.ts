import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CronExpression, Cron } from '@nestjs/schedule';

const REMINDER_DAYS_BEFORE_EXPIRY = 3;

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('membership-reminder') private reminderQueue: Queue
    ) {}

  async create(userId: string, planId: string) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Paket membership tidak ditemukan atau tidak aktif');
    }

    const existingPending = await this.prisma.membership.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (existingPending) {
      throw new BadRequestException('Kamu masih punya pendaftaran membership yang belum diproses');
    }

    return this.prisma.membership.create({
      data: {
        userId,
        planId,
        status: 'PENDING',
        ptSessionsRemaining: plan.ptSessionQuota,
      },
      include: { plan: true },
    });
  }

  async findMyMemberships(userId: string) {
    return this.prisma.membership.findMany({
      where: { userId },
      include: { plan: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireOutdatedMemberships() {
    const result = await this.prisma.membership.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    if (result.count > 0) {
      this.logger.log(`${result.count} membership otomatis di-set EXPIRED`);
    }
  }

  async findActiveMembership(userId: string) {
    return this.prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: { plan: true },
    });
  }
  
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkExpiringMemberships() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + REMINDER_DAYS_BEFORE_EXPIRY);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const expiringMemberships = await this.prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: targetDate, lt: nextDay },
      },
    });

    for (const membership of expiringMemberships) {
      await this.reminderQueue.add('send-reminder', {
        userId: membership.userId,
        membershipId: membership.id,
        daysRemaining: REMINDER_DAYS_BEFORE_EXPIRY,
      });
    }

    if (expiringMemberships.length > 0) {
      this.logger.log(`${expiringMemberships.length} job reminder ditambahkan ke antrian`);
    }
  }

    async findAllPlans() {
    return this.prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async createPlan(data: {
  name: string;
  durationDays: number;
  price: number;
  ptSessionQuota?: number;
}) {
  return this.prisma.membershipPlan.create({
    data: {
      name: data.name,
      durationDays: data.durationDays,
      price: data.price,
      ptSessionQuota: data.ptSessionQuota ?? 0,
    },
  });
}

  async findAllPlansAdmin() {
    return this.prisma.membershipPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async updatePlan(
    id: string,
    data: {
      name?: string;
      durationDays?: number;
      price?: number;
      ptSessionQuota?: number;
      isActive?: boolean;
    },
  ) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Paket membership tidak ditemukan');
    }

    return this.prisma.membershipPlan.update({ where: { id }, data });
  }

    async cancelPending(membershipId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      include: { payment: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership tidak ditemukan');
    }

    if (membership.userId !== userId) {
      throw new ForbiddenException('Membership ini bukan milikmu');
    }

    if (membership.status !== 'PENDING') {
      throw new BadRequestException('Hanya membership berstatus PENDING yang bisa dibatalkan');
    }

    if (membership.payment) {
      throw new BadRequestException('Tidak bisa membatalkan, bukti pembayaran sudah dikirim');
    }

    return this.prisma.membership.delete({ where: { id: membershipId } });
  }
}