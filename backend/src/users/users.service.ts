import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RoleType,Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    role?: RoleType;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll(params: {
    role?: RoleType;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { role, search, page = 1, limit = 10 } = params;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
              { ktaNumber: { contains: search} },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          ktaNumber: true,
          role: true,
          createdAt: true,
          memberships: {
            where: { status: 'ACTIVE', endDate: { gte: new Date() } },
            select: { plan: { select: { name: true } }, endDate: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = users.map((user) => {
      const { memberships, ...rest } = user;
      return {
        ...rest,
        activeMembership: memberships[0]
          ? { planName: memberships[0].plan.name, endDate: memberships[0].endDate }
          : null,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateRole(targetUserId: string, newRole: RoleType, requestingUserRole: RoleType) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });

    if (!targetUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const highLevelRoles: RoleType[] = ['ADMIN', 'OWNER'];
    const isPromotingToHighLevel = highLevelRoles.includes(newRole);
    const isTargetCurrentlyHighLevel = highLevelRoles.includes(targetUser.role);

    if ((isPromotingToHighLevel || isTargetCurrentlyHighLevel) && requestingUserRole !== 'OWNER') {
      throw new ForbiddenException('Hanya OWNER yang boleh mengubah role menjadi/dari ADMIN atau OWNER');
    }

    const isDemotingFromTrainer = targetUser.role === 'PERSONAL_TRAINER' && newRole !== 'PERSONAL_TRAINER';

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
        select: { id: true, email: true, fullName: true, role: true },
      });

      if (isDemotingFromTrainer) {
        await tx.trainerProfile.updateMany({
          where: { userId: targetUserId },
          data: { isActive: false },
        });
      }

      return updatedUser;
    });
  }

  async getMyKta(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      ktaNumber: true,
      createdAt: true,
      memberships: {
        where: { status: 'ACTIVE', endDate: { gte: new Date() } },
        select: { plan: { select: { name: true } }, startDate: true, endDate: true },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new NotFoundException('User tidak ditemukan');
  }

  if (!user.ktaNumber) {
    throw new BadRequestException('Kamu belum memiliki KTA. KTA akan dibuat otomatis setelah membership pertamamu disetujui admin.');
  }

  const { memberships, ...rest } = user;

  return {
    ...rest,
    activeMembership: memberships[0]
      ? {
          planName: memberships[0].plan.name,
          startDate: memberships[0].startDate,
          endDate: memberships[0].endDate,
        }
      : null,
  };
  }
}