import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from 'prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };

  let jwtService: {
    verify: jest.Mock;
    sign: jest.Mock;
  };

  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: PrismaService,
          useValue: {
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
            findById: jest.fn(),
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

    it('berhasil menerbitkan token baru saat refresh token valid', async () => {
      jwtService.verify.mockReturnValue(mockPayload);

      usersService.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'MEMBER',
        refreshTokenHash: 'hashed-value',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      prisma.user.update.mockResolvedValue({});

      jwtService.sign.mockReturnValue('new-signed-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-value');

      const result = await authService.refreshTokens(
        'valid-refresh-token',
        meta,
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { refreshTokenHash: 'new-hashed-value' },
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('menolak jika hash tidak cocok dengan yang tersimpan', async () => {
      jwtService.verify.mockReturnValue(mockPayload);

      usersService.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'MEMBER',
        refreshTokenHash: 'hashed-value',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.refreshTokens('mismatched-refresh-token', meta),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('menolak jika user tidak memiliki refreshTokenHash tersimpan', async () => {
      jwtService.verify.mockReturnValue(mockPayload);

      usersService.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        role: 'MEMBER',
        refreshTokenHash: null,
      });

      await expect(
        authService.refreshTokens('some-refresh-token', meta),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('menolak jika user tidak ditemukan', async () => {
      jwtService.verify.mockReturnValue(mockPayload);

      usersService.findById.mockResolvedValue(null);

      await expect(
        authService.refreshTokens('some-refresh-token', meta),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('menolak jika verifikasi JWT gagal', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(
        authService.refreshTokens('invalid-refresh-token', meta),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.findById).not.toHaveBeenCalled();
    });
  });
});