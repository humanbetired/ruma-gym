import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async submitProof(userId: string, dto: { membershipId: string; amount: number }, proofImageUrl: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: dto.membershipId },
    });

    if (!membership) {
      throw new NotFoundException('Membership tidak ditemukan');
    }

    if (membership.userId !== userId) {
      throw new ForbiddenException('Membership ini bukan milikmu');
    }

    if (membership.status !== 'PENDING') {
      throw new BadRequestException('Membership ini sudah diproses sebelumnya');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { membershipId: dto.membershipId },
    });

    if (existingPayment) {
      throw new BadRequestException('Bukti pembayaran untuk membership ini sudah pernah dikirim');
    }

    return this.prisma.payment.create({
      data: {
        membershipId: dto.membershipId,
        userId,
        amount: dto.amount,
        proofImageUrl,
        status: 'PENDING',
      },
    });
  }

  async findAllPending() {
    return this.prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        membership: { include: { plan: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

async approve(paymentId: string, adminId: string) {
  const payment = await this.prisma.payment.findUnique({
    where: { id: paymentId },
    include: { membership: { include: { plan: true } } },
  });

  if (!payment) {
    throw new NotFoundException('Payment tidak ditemukan');
  }

  if (payment.status !== 'PENDING') {
    throw new BadRequestException('Payment ini sudah diproses sebelumnya');
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + payment.membership.plan.durationDays);

  const user = await this.prisma.user.findUnique({ where: { id: payment.userId } });
  const needsKtaNumber = user && !user.ktaNumber;

  return this.prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    await tx.membership.update({
      where: { id: payment.membershipId },
      data: {
        status: 'ACTIVE',
        startDate,
        endDate,
      },
    });

    if (needsKtaNumber) {
      const ktaNumber = await this.generateKtaNumber(tx);
      await tx.user.update({
        where: { id: payment.userId },
        data: { ktaNumber },
      });
    }

    return updatedPayment;
  });
}

private async generateKtaNumber(tx: Prisma.TransactionClient): Promise<string> {
  const now = new Date();
  const yearPart = String(now.getFullYear()).slice(-2);
  const monthPart = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${yearPart}${monthPart}`;

  const lastUser = await tx.user.findFirst({
    where: { ktaNumber: { startsWith: prefix } },
    orderBy: { ktaNumber: 'desc' },
    select: { ktaNumber: true },
  });

  let sequence = 1;
  if (lastUser?.ktaNumber) {
    const lastSequence = parseInt(lastUser.ktaNumber.slice(prefix.length), 10);
    sequence = lastSequence + 1;
  }

  const sequencePart = String(sequence).padStart(3, '0');
  return `${prefix}${sequencePart}`;
}

  async reject(paymentId: string, adminId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Payment ini sudah diproses sebelumnya');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      await tx.membership.update({
        where: { id: payment.membershipId },
        data: { status: 'REJECTED' },
      });

      return updatedPayment;
    });
  }
}