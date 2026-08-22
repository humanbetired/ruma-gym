import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from 'prisma/prisma.service';

// Mock module bcrypt secara keseluruhan
// supaya kita bisa kontrol hasil bcrypt.compare() (true/false)
// tanpa benar-benar menjalankan hashing asli
// (yang lambat dan tidak perlu untuk unit test logic).
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  let prisma: {
    refreshToken: {
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
  };

  let jwtService: {
    verify: jest.Mock;
    sign: jest.Mock;
  };

  let usersService: {
    findByEmail: jest.Mock;
  };

  beforeEach(async () => {
    // Reset semua mock sebelum tiap test
    // supaya test satu tidak "bocor" pengaturan mock-nya
    // ke test yang lain.
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              create: jest.fn(),
            },

            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },

        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },

        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },

        {
          provide: MailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  describe('refreshTokens', () => {
    const meta = {
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1',
    };

    const mockPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'MEMBER',
    };

    it('berhasil rotate token: token lama di-revoke, token baru diterbitkan', async () => {
      // Arrange: siapkan skenario "token valid dan cocok"
      jwtService.verify.mockReturnValue(mockPayload);

      const existingToken = {
        id: 'token-abc',
        userId: 'user-123',
        tokenHash: 'hashed-value',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      };

      prisma.refreshToken.findMany.mockResolvedValue([existingToken]);

      // Token cocok
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      usersService.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'MEMBER',
      });

      prisma.refreshToken.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      jwtService.sign.mockReturnValue('new-signed-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-value');

      // Act
      const result = await authService.refreshTokens(
        'valid-refresh-token',
        meta,
      );

      // Assert: token LAMA harus di-revoke
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-abc' },
        data: { isRevoked: true },
      });

      // Assert: token BARU harus diterbitkan
      expect(prisma.refreshToken.create).toHaveBeenCalled();

      // Assert: hasil akhir mengandung access & refresh token baru
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('mendeteksi reuse: revoke SEMUA token user saat token yang sudah revoked dipakai lagi', async () => {
      jwtService.verify.mockReturnValue(mockPayload);

      const revokedToken = {
        id: 'token-abc',
        userId: 'user-123',
        tokenHash: 'hashed-value',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      };

      prisma.refreshToken.findMany.mockResolvedValue([revokedToken]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      // Act & Assert: harus melempar UnauthorizedException
      await expect(
        authService.refreshTokens('stolen-refresh-token', meta),
      ).rejects.toThrow(UnauthorizedException);

      // Assert: SEMUA token user harus di-revoke
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: { isRevoked: true },
      });
    });

    it('menolak token yang sudah lewat masa berlaku', async () => {
      jwtService.verify.mockReturnValue(mockPayload);

      const expiredToken = {
        id: 'token-abc',
        userId: 'user-123',
        tokenHash: 'hashed-value',
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60),
      };

      prisma.refreshToken.findMany.mockResolvedValue([expiredToken]);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.refreshTokens('expired-refresh-token', meta),
      ).rejects.toThrow(UnauthorizedException);

      // Token expired tidak boleh memicu "revoke semua sesi"
      // karena expired adalah kondisi normal, bukan indikasi serangan.
      expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });
  });
});