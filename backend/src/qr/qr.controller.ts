import { Controller, Post, Get } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { PrismaService } from 'prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('qr')
export class QrController {
  constructor(private prisma: PrismaService) {}
  @Post('generate-static')
  @Auth('ADMIN', 'OWNER')
  async generateStaticToken() {
    const token = uuidv4();

    const qrToken = await this.prisma.qrToken.create({
      data: {
        token,
        expiresAt: new Date('2099-12-31'),
      },
    });

    return { token: qrToken.token, message: 'Simpan token ini dan generate QR image dari nilai ini.' };
  }

  @Get('current-static')
  @Auth('ADMIN', 'OWNER')
  async getCurrentStaticToken() {
    const latest = await this.prisma.qrToken.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return latest ? { token: latest.token } : { token: null };
  }
}