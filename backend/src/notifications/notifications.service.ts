import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, message: string) {
    return this.prisma.notification.create({
      data: { userId, type, message },
    });
  }

  async findMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Notifikasi ini bukan milikmu');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}