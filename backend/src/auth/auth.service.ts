import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from 'prisma/prisma.service';

const EMAIL_VERIFY_EXPIRY_HOURS = 24;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  async register(dto: { email: string; password: string; fullName: string; phone?: string }) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const emailVerifyToken = uuidv4();
    const emailVerifyExpiry = new Date(Date.now() + EMAIL_VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        emailVerifyToken,
        emailVerifyExpiry,
      },
    });

    await this.mailService.sendVerificationEmail(user.email, user.fullName, emailVerifyToken);

    return {
      message: 'Registrasi berhasil. Silakan cek email kamu untuk verifikasi sebelum login.',
    };
  }

  async login(dto: { email: string; password: string }, meta: RequestMeta) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Akun ini terdaftar lewat Google. Silakan login dengan Google.',
      );
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email kamu belum diverifikasi. Silakan cek inbox untuk link verifikasi.',
      );
    }

    return this.issueTokens(user.id, user.email, user.role, meta);
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({ where: { emailVerifyToken: token } });

    if (!user) {
      throw new BadRequestException('Token verifikasi tidak valid');
    }

    if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
      throw new BadRequestException('Token verifikasi sudah kedaluwarsa, minta link baru');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    return { message: 'Email berhasil diverifikasi. Silakan login.' };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return { message: 'Kalau email terdaftar, link verifikasi baru sudah dikirim.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email ini sudah terverifikasi.');
    }

    const emailVerifyToken = uuidv4();
    const emailVerifyExpiry = new Date(Date.now() + EMAIL_VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpiry },
    });

    await this.mailService.sendVerificationEmail(user.email, user.fullName, emailVerifyToken);

    return { message: 'Kalau email terdaftar, link verifikasi baru sudah dikirim.' };
  }

  async refreshTokens(refreshToken: string, meta: RequestMeta) {
    let payload: { sub: string; email: string; role: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau kedaluwarsa');
    }
    const candidateTokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub },
    });

    let matchedToken: (typeof candidateTokens)[number] | null = null;
    for (const candidate of candidateTokens) {
      const isMatch = await bcrypt.compare(refreshToken, candidate.tokenHash);
      if (isMatch) {
        matchedToken = candidate;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Sesi tidak ditemukan, silakan login ulang');
    }

    if (matchedToken.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Terdeteksi aktivitas mencurigakan. Semua sesi telah diakhiri, silakan login ulang.',
      );
    }

    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token sudah kedaluwarsa, silakan login ulang');
    }

    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { isRevoked: true },
    });

    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return this.issueTokens(user.id, user.email, user.role, meta);
  }

  async logout(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      return { message: 'Logout berhasil' };
    }

    const candidateTokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, isRevoked: false },
    });

    for (const candidate of candidateTokens) {
      const isMatch = await bcrypt.compare(refreshToken, candidate.tokenHash);
      if (isMatch) {
        await this.prisma.refreshToken.update({
          where: { id: candidate.id },
          data: { isRevoked: true },
        });
        break;
      }
    }

    return { message: 'Logout berhasil' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Berhasil logout dari semua perangkat' };
  }

  private async issueTokens(userId: string, email: string, role: string, meta: RequestMeta) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async validateGoogleUser(googleProfile: { googleId: string; email: string; fullName: string }, meta: RequestMeta) {
    let user = await this.prisma.user.findUnique({ where: { googleId: googleProfile.googleId } });

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email: googleProfile.email } });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleProfile.googleId, isEmailVerified: true },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: googleProfile.email,
            fullName: googleProfile.fullName,
            googleId: googleProfile.googleId,
            isEmailVerified: true,
          },
        });
      }
    }

    return this.issueTokens(user.id, user.email, user.role, meta);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return { message: 'Kalau email terdaftar, link reset password sudah dikirim.' };
    }

    const resetPasswordToken = uuidv4();
    const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpiry },
    });

    await this.mailService.sendPasswordResetEmail(user.email, user.fullName, resetPasswordToken);

    return { message: 'Kalau email terdaftar, link reset password sudah dikirim.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { resetPasswordToken: token } });

    if (!user) {
      throw new BadRequestException('Token reset password tidak valid');
    }

    if (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date()) {
      throw new BadRequestException('Token reset password sudah kedaluwarsa, silakan minta link baru');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });
    await this.logoutAll(user.id);

    return { message: 'Password berhasil diubah. Silakan login dengan password baru.' };
  }
}