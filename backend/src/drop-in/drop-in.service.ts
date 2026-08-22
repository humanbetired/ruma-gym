import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DropInService {
  constructor(private prisma: PrismaService) {}

  async create(recordedBy: string, data: { visitorName: string; visitorPhone?: string; amount: number }) {
    return this.prisma.dropInVisit.create({
      data: {
        visitorName: data.visitorName,
        visitorPhone: data.visitorPhone,
        amount: data.amount,
        recordedBy,
      },
    });
  }

  async checkout(id: string) {
    const visit = await this.prisma.dropInVisit.findUnique({ where: { id } });

    if (!visit) {
      throw new NotFoundException('Data kunjungan tidak ditemukan');
    }

    if (visit.checkOutTime) {
      throw new BadRequestException('Kunjungan ini sudah di-checkout sebelumnya');
    }

    return this.prisma.dropInVisit.update({
      where: { id },
      data: { checkOutTime: new Date() },
    });
  }

  async findToday() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return this.prisma.dropInVisit.findMany({
      where: { checkInTime: { gte: todayStart } },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async findAll(from?: Date, to?: Date) {
    return this.prisma.dropInVisit.findMany({
      where: {
        checkInTime: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      },
      include: {
        recordedByUser: { select: { fullName: true } },
      },
      orderBy: { checkInTime: 'desc' },
    });
    }

    async getDailyRevenue(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const visits = await this.prisma.dropInVisit.findMany({
        where: { checkInTime: { gte: startDate } },
        select: { checkInTime: true, amount: true },
    });

    const grouped: Record<string, { count: number; revenue: number }> = {};

    for (const visit of visits) {
        const dateKey = visit.checkInTime.toISOString().split('T')[0];
        if (!grouped[dateKey]) {
        grouped[dateKey] = { count: 0, revenue: 0 };
        }
        grouped[dateKey].count += 1;
        grouped[dateKey].revenue += Number(visit.amount);
    }

    return Object.entries(grouped)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
}