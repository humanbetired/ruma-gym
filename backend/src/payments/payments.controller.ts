import { Controller, Post, Get, Patch, Param, Body, UploadedFile, UseInterceptors, BadRequestException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { paymentProofMulterConfig } from '../common/config/multer.config';
import { processAndSaveImage } from '../common/utils/image.util';
import { join } from 'path';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @Auth()
  @UseInterceptors(FileInterceptor('proofImage', paymentProofMulterConfig))
  async submitProof(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Bukti pembayaran wajib diupload');
    }

    const filename = await processAndSaveImage(
      file.buffer,
      join(process.cwd(), 'uploads', 'payment-proofs'),
      { maxWidth: 2000, quality: 92 },
    );

    const proofImageUrl = `/uploads/payment-proofs/${filename}`;
    return this.paymentsService.submitProof(user.userId, dto, proofImageUrl);
  }

  @Get('pending')
  @Auth('ADMIN', 'OWNER')
  findAllPending() {
    return this.paymentsService.findAllPending();
  }

  @Patch(':id/approve')
  @Auth('ADMIN', 'OWNER')
  approve(@Param('id') id: string, @CurrentUser() admin: { userId: string }) {
    return this.paymentsService.approve(id, admin.userId);
  }

  @Patch(':id/reject')
  @Auth('ADMIN', 'OWNER')
  reject(
    @Param('id') id: string,
    @CurrentUser() admin: { userId: string },
    @Body() dto: RejectPaymentDto,
  ) {
    return this.paymentsService.reject(id, admin.userId, dto.reason);
  }
}