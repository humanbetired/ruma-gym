import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  async create(memberId: string, dto: { scheduleId: string; notes?: string }) {
    const schedule = await this.prisma.trainerSchedule.findUnique({
      where: { id: dto.scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    if (schedule.isBooked) {
      throw new BadRequestException('Slot jadwal ini sudah dibooking orang lain');
    }

    const activeMembership = await this.prisma.membership.findFirst({
      where: {
        userId: memberId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    });

    if (!activeMembership) {
      throw new BadRequestException('Kamu tidak punya membership aktif');
    }

    if (activeMembership.ptSessionsRemaining <= 0) {
      throw new BadRequestException('Kuota sesi PT kamu sudah habis');
    }

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.ptBooking.create({
        data: {
          memberId,
          trainerId: schedule.trainerId,
          scheduleId: dto.scheduleId,
          notes: dto.notes,
          status: 'PENDING',
        },
      });

      await tx.trainerSchedule.update({
        where: { id: dto.scheduleId },
        data: { isBooked: true },
      });

      return booking;
    });
  }

  async findMyBookingsAsMember(memberId: string) {
    return this.prisma.ptBooking.findMany({
      where: { memberId },
      include: {
        trainer: { include: { user: { select: { fullName: true } } } },
        schedule: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyBookingsAsTrainer(trainerId: string) {
    return this.prisma.ptBooking.findMany({
      where: { trainerId },
      include: {
        member: { select: { fullName: true, phone: true } },
        schedule: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPending() {
    return this.prisma.ptBooking.findMany({
      where: { status: 'PENDING' },
      include: {
        member: { select: { fullName: true, email: true } },
        trainer: { include: { user: { select: { fullName: true } } } },
        schedule: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approve(bookingId: string, adminId: string) {
    const booking = await this.prisma.ptBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking ini sudah diproses sebelumnya');
    }

    const activeMembership = await this.prisma.membership.findFirst({
      where: { userId: booking.memberId, status: 'ACTIVE' },
    });

    if (!activeMembership || activeMembership.ptSessionsRemaining <= 0) {
      throw new BadRequestException('Member ini tidak lagi punya kuota sesi PT tersisa');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.ptBooking.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.membership.update({
        where: { id: activeMembership.id },
        data: { ptSessionsRemaining: { decrement: 1 } },
      });

      return updatedBooking;
    });
  }

  async reject(bookingId: string, adminId: string) {
    const booking = await this.prisma.ptBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking ini sudah diproses sebelumnya');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.ptBooking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.trainerSchedule.update({
        where: { id: booking.scheduleId },
        data: { isBooked: false },
      });

      return updatedBooking;
    });
  }

  async findMyConfirmedSchedule(memberId: string, from?: Date, to?: Date) {
  return this.prisma.ptBooking.findMany({
    where: {
      memberId,
      status: 'APPROVED',
      schedule: {
        ...(from || to
          ? {
              startTime: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
    },
    include: {
      trainer: {
        select: {
          photoUrl: true,
          user: { select: { fullName: true } },
        },
      },
      schedule: true,
    },
    orderBy: { schedule: { startTime: 'asc' } },
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async completeFinishedBookings() {
    const result = await this.prisma.ptBooking.updateMany({
      where: {
        status: 'APPROVED',
        schedule: { endTime: { lt: new Date() } },
      },
      data: { status: 'COMPLETED' },
    });

    if (result.count > 0) {
      this.logger.log(`${result.count} booking otomatis ditandai COMPLETED`);
    }
  }
}