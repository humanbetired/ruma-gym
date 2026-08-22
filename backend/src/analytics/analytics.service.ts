import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

    async getDailyVisits(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM check_in_logs
        WHERE type = 'CHECK_IN' AND createdAt >= ${startDate}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
    `;

    return result.map((row) => ({ date: row.date, count: Number(row.count) }));
    }

    async getPeakHours(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.prisma.$queryRaw<{ hour: number; count: bigint }[]>`
        SELECT HOUR(createdAt) as hour, COUNT(*) as count
        FROM check_in_logs
        WHERE type = 'CHECK_IN' AND createdAt >= ${startDate}
        GROUP BY HOUR(createdAt)
        ORDER BY hour ASC
    `;

    const hourMap = new Map(result.map((row) => [row.hour, Number(row.count)]));
    return Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourMap.get(hour) ?? 0,
    }));
    }

    async getMemberGrowth(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count
        FROM users
        WHERE role = 'MEMBER' AND createdAt >= ${startDate}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month ASC
    `;

    return result.map((row) => ({ month: row.month, count: Number(row.count) }));
    }

    async getMemberStats(userId: string) {
    const [aggregate, recentVisits] = await Promise.all([
        this.prisma.checkInLog.aggregate({
        where: { userId, type: 'CHECK_OUT', durationMinutes: { not: null } },
        _count: { id: true },
        _sum: { durationMinutes: true },
        }),
        this.prisma.checkInLog.findMany({
        where: { userId, type: 'CHECK_OUT', durationMinutes: { not: null } },
        select: { durationMinutes: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10, 
        }),
    ]);

    const totalVisits = aggregate._count.id;
    const totalDuration = aggregate._sum.durationMinutes ?? 0;
    const averageDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

    return {
        totalVisits,
        averageDurationMinutes: averageDuration,
        totalDurationMinutes: totalDuration,
        recentVisits,
    };
    }

    async getFinancialReport(from: Date, to: Date) {
        const [approvedPayments, dropInVisits, warungTransactions] = await Promise.all([
            this.prisma.payment.findMany({
            where: {
                status: 'APPROVED',
                reviewedAt: { gte: from, lte: to },
            },
            include: {
                user: { select: { fullName: true } },
                membership: { include: { plan: { select: { name: true } } } },
            },
            orderBy: { reviewedAt: 'asc' },
            }),
            this.prisma.dropInVisit.findMany({
            where: { checkInTime: { gte: from, lte: to } },
            orderBy: { checkInTime: 'asc' },
            }),
            this.prisma.warungTransaction.findMany({
            where: { createdAt: { gte: from, lte: to } },
            include: { items: true, recordedByUser: { select: { fullName: true } } },
            orderBy: { createdAt: 'asc' },
            }),
        ]);

        const membershipTotal = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const dropInTotal = dropInVisits.reduce((sum, v) => sum + Number(v.amount), 0);
        const warungTotal = warungTransactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);

        return {
            period: { from, to },
            summary: {
            membership: { total: membershipTotal, count: approvedPayments.length },
            dropIn: { total: dropInTotal, count: dropInVisits.length },
            warung: { total: warungTotal, count: warungTransactions.length },
            grandTotal: membershipTotal + dropInTotal + warungTotal,
            },
            details: {
            membership: approvedPayments.map((p) => ({
                date: p.reviewedAt,
                memberName: p.user.fullName,
                planName: p.membership.plan.name,
                amount: Number(p.amount),
            })),
            dropIn: dropInVisits.map((v) => ({
                date: v.checkInTime,
                visitorName: v.visitorName,
                amount: Number(v.amount),
            })),
            warung: warungTransactions.map((t) => ({
                date: t.createdAt,
                recordedBy: t.recordedByUser.fullName,
                items: t.items.map((i) => `${i.productName} x${i.quantity}`).join(', '),
                amount: Number(t.totalAmount),
            })),
            },
        };
        }
}