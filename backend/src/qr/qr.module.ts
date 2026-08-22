import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrGateway } from './qr.gateway';

@Module({
  providers: [QrService, QrGateway],
  exports: [QrService]
})

export class QrModule {}