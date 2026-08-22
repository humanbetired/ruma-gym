import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from 'prisma/prisma.service';

describe('BookingsService', () => {
  let bookingsService: BookingsService;
  let prisma: {
    ptBooking: { findUnique: jest.Mock; update: jest.Mock };
    membership: { findFirst: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: {
            ptBooking: { findUnique: jest.fn(), update: jest.fn() },
            membership: { findFirst: jest.fn(), update: jest.fn() },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService);
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
  });

  describe('approve', () => {
    it('approve booking: update status APPROVED dan kurangi ptSessionsRemaining tepat 1', async () => {
      prisma.ptBooking.findUnique.mockResolvedValue({
        id: 'booking-1',
        memberId: 'member-1',
        status: 'PENDING',
      });
      prisma.membership.findFirst.mockResolvedValue({
        id: 'membership-1',
        userId: 'member-1',
        status: 'ACTIVE',
        ptSessionsRemaining: 5,
      });
      prisma.ptBooking.update.mockResolvedValue({ id: 'booking-1', status: 'APPROVED' });
      prisma.membership.update.mockResolvedValue({});

      await bookingsService.approve('booking-1', 'admin-1');

      // Poin paling penting: verifikasi pengurangan kuota pakai operator `decrement`,
      // BUKAN kalkulasi manual (misal ptSessionsRemaining - 1 dihitung di JS lalu di-set).
      // decrement itu ATOMIK di level database -- aman dari race condition kalau ada
      // 2 approval berjalan bersamaan, beda dengan kalkulasi manual yang rawan "lompat".
      expect(prisma.membership.update).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
        data: { ptSessionsRemaining: { decrement: 1 } },
      });

      expect(prisma.ptBooking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: expect.objectContaining({ status: 'APPROVED', reviewedBy: 'admin-1' }),
      });
    });

    it('menolak approve kalau member tidak lagi punya kuota PT session', async () => {
      prisma.ptBooking.findUnique.mockResolvedValue({
        id: 'booking-2',
        memberId: 'member-2',
        status: 'PENDING',
      });
      prisma.membership.findFirst.mockResolvedValue({
        id: 'membership-2',
        ptSessionsRemaining: 0, // kuota habis
      });

      await expect(bookingsService.approve('booking-2', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );

      // Tidak boleh ada perubahan data apapun kalau validasi kuota gagal
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('menolak approve kalau member tidak punya membership aktif sama sekali', async () => {
      prisma.ptBooking.findUnique.mockResolvedValue({
        id: 'booking-3',
        memberId: 'member-3',
        status: 'PENDING',
      });
      prisma.membership.findFirst.mockResolvedValue(null); // tidak ada membership aktif

      await expect(bookingsService.approve('booking-3', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('menolak approve booking yang sudah diproses sebelumnya', async () => {
      prisma.ptBooking.findUnique.mockResolvedValue({
        id: 'booking-4',
        status: 'APPROVED', // sudah diproses
      });

      await expect(bookingsService.approve('booking-4', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('melempar NotFoundException kalau booking tidak ditemukan', async () => {
      prisma.ptBooking.findUnique.mockResolvedValue(null);

      await expect(bookingsService.approve('booking-tidak-ada', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});