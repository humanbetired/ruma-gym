import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TrainersService {
  constructor(private prisma: PrismaService) {}

  async createProfile(data: { userId: string; bio?: string; specialty?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role !== 'PERSONAL_TRAINER') {
      throw new ConflictException('User ini bukan berrole PERSONAL_TRAINER');
    }

    const existing = await this.prisma.trainerProfile.findUnique({
      where: { userId: data.userId },
    });

    if (existing && existing.isActive) {
      throw new ConflictException('User ini sudah punya profil trainer aktif');
    }

    if (existing && !existing.isActive) {
      return this.prisma.trainerProfile.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          bio: data.bio ?? existing.bio,
          specialty: data.specialty ?? existing.specialty,
        },
      });
    }

    return this.prisma.trainerProfile.create({ data });
  }

  async findAllPublic() {
    return this.prisma.trainerProfile.findMany({
      where: { isActive: true },
      include: { user: { select: { fullName: true } } },
    });
  }

  async findOne(id: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { id },
      include: { user: { select: { fullName: true, email: true, phone: true } } },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer tidak ditemukan');
    }

    return trainer;
  }

  async update(id: string, data: { bio?: string; specialty?: string }) {
    await this.findOne(id);
    return this.prisma.trainerProfile.update({ where: { id }, data });
  }

  async findByUserId(userId: string) {
    const trainer = await this.prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundException(
        'Profil trainer kamu belum dibuat oleh admin. Silakan hubungi admin untuk melengkapi profilmu.',
      );
    }

    if (!trainer.isActive) {
      throw new ForbiddenException('Profil trainer kamu sedang tidak aktif. Silakan hubungi admin.');
    }

    return trainer;
  }

  async createSchedule(trainerId: string, data: { date: string; startTime: string; endTime: string }) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('Waktu selesai harus setelah waktu mulai');
    }

    return this.prisma.trainerSchedule.create({
      data: {
        trainerId,
        date: new Date(data.date),
        startTime,
        endTime,
      },
    });
  }

  async findSchedulesByTrainer(trainerId: string, onlyAvailable = false, requestingUserId?: string) {
    let maxDate: Date | undefined;

    if (onlyAvailable && requestingUserId) {
      const activeMembership = await this.prisma.membership.findFirst({
        where: {
          userId: requestingUserId,
          status: 'ACTIVE',
          endDate: { gte: new Date() },
        },
      });

      if (activeMembership?.endDate) {
        maxDate = activeMembership.endDate;
      }
    }

    return this.prisma.trainerSchedule.findMany({
      where: {
        trainerId,
        ...(onlyAvailable ? { isBooked: false } : {}),
        ...(maxDate ? { startTime: { lte: maxDate } } : {}),
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async removeSchedule(scheduleId: string, requestingTrainerId: string) {
    const schedule = await this.prisma.trainerSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    if (schedule.trainerId !== requestingTrainerId) {
      throw new ForbiddenException('Kamu tidak bisa menghapus jadwal trainer lain');
    }

    if (schedule.isBooked) {
      throw new BadRequestException('Jadwal yang sudah dibooking tidak bisa dihapus');
    }

    return this.prisma.trainerSchedule.delete({ where: { id: scheduleId } });
  }

  async updateOwnProfile(
  trainerId: string,
  requestingUserId: string,
  data: { bio?: string; specialty?: string; photoUrl?: string },
  ) {
    const trainer = await this.prisma.trainerProfile.findUnique({ where: { id: trainerId } });

    if (!trainer) {
      throw new NotFoundException('Profil trainer tidak ditemukan');
    }

    if (trainer.userId !== requestingUserId) {
      throw new ForbiddenException('Kamu tidak bisa mengubah profil trainer lain');
    }

    return this.prisma.trainerProfile.update({ where: { id: trainerId }, data });
  }
}