import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from 'prisma/prisma.service';

describe('PaymentsService', () => {
  let paymentsService: PaymentsService;
  let prisma: {
    membership: { findUnique: jest.Mock; update: jest.Mock };
    payment: { findUnique: jest.Mock; findMany: jest.Mock; create: jest.Mock; update: jest.Mock };
    user: { findUnique: jest.Mock; update: jest.Mock; findFirst: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            membership: { findUnique: jest.fn(), update: jest.fn() },
            payment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
            user: { findUnique: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
            // $transaction dibuat langsung mengeksekusi callback-nya, dengan `prisma` mock
            // ini sendiri sebagai `tx` -- supaya tx.payment.update dkk memanggil mock yang sama.
            $transaction: jest.fn((callback) => callback(prisma)),
          },
        },
      ],
    }).compile();

    paymentsService = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService);

    // $transaction perlu diatur ULANG di sini karena `prisma` di atas belum ter-assign
    // saat useValue didefinisikan (masalah urutan inisialisasi) -- jadi kita set manual
    // implementasinya setelah `prisma` benar-benar ada.
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
  });

  describe('approve', () => {
  it('approve payment: update status, aktifkan membership, generate KTA untuk user yang belum punya', async () => {
    const mockPayment = {
      id: 'payment-1',
      userId: 'user-1',
      membershipId: 'membership-1',
      status: 'PENDING',
      membership: { plan: { durationDays: 30 } },
    };
    prisma.payment.findUnique.mockResolvedValue(mockPayment);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', ktaNumber: null }); // belum punya KTA
    prisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'APPROVED' });
    prisma.membership.update.mockResolvedValue({});
    prisma.user.findFirst.mockResolvedValue(null); // belum ada KTA lain bulan ini -- sequence mulai dari 1
    prisma.user.update.mockResolvedValue({});

    const result = await paymentsService.approve('payment-1', 'admin-1');

    // Payment harus di-update jadi APPROVED dengan reviewer yang benar
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      data: expect.objectContaining({ status: 'APPROVED', reviewedBy: 'admin-1' }),
    });

    // Membership harus diaktifkan
    expect(prisma.membership.update).toHaveBeenCalledWith({
      where: { id: 'membership-1' },
      data: expect.objectContaining({ status: 'ACTIVE' }),
    });

    // KTA number harus digenerate dan disimpan (karena user belum punya)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { ktaNumber: expect.stringMatching(/^\d{4}001$/) }, // format: YYMM + sequence 3 digit
    });

    expect(result.status).toBe('APPROVED');
  });

  it('TIDAK generate KTA baru kalau user sudah punya KTA number', async () => {
    const mockPayment = {
      id: 'payment-2',
      userId: 'user-2',
      membershipId: 'membership-2',
      status: 'PENDING',
      membership: { plan: { durationDays: 30 } },
    };
    prisma.payment.findUnique.mockResolvedValue(mockPayment);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-2', ktaNumber: '2508001' }); // SUDAH punya KTA
    prisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'APPROVED' });
    prisma.membership.update.mockResolvedValue({});

    await paymentsService.approve('payment-2', 'admin-1');

    // user.update untuk KTA number TIDAK BOLEH dipanggil sama sekali
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('menolak approve payment yang sudah diproses sebelumnya', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: 'payment-3',
      status: 'APPROVED', // sudah diproses
      membership: { plan: { durationDays: 30 } },
    });

    await expect(paymentsService.approve('payment-3', 'admin-1')).rejects.toThrow(
      BadRequestException,
    );

    // Tidak boleh ada perubahan data apapun kalau validasi gagal
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('melempar NotFoundException kalau payment tidak ditemukan', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);

    await expect(paymentsService.approve('payment-tidak-ada', 'admin-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});

  it('KTA number melanjutkan sequence dari nomor terakhir bulan yang sama', async () => {
    const mockPayment = {
      id: 'payment-4',
      userId: 'user-4',
      membershipId: 'membership-4',
      status: 'PENDING',
      membership: { plan: { durationDays: 30 } },
    };
    prisma.payment.findUnique.mockResolvedValue(mockPayment);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-4', ktaNumber: null });
    prisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'APPROVED' });
    prisma.membership.update.mockResolvedValue({});

    // Simulasikan sudah ada user dengan KTA nomor urut 007 di bulan yang sama
    const now = new Date();
    const prefix = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    prisma.user.findFirst.mockResolvedValue({ ktaNumber: `${prefix}007` });
    prisma.user.update.mockResolvedValue({});

    await paymentsService.approve('payment-4', 'admin-1');

    // Sequence berikutnya harus 008, bukan mengulang dari 001
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-4' },
      data: { ktaNumber: `${prefix}008` },
    });
  });

});