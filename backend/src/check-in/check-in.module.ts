import { Module } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';
import { CheckInGateway } from './check-in.gateway';
import { QrModule } from '../qr/qr.module';

@Module({
  imports: [QrModule],
  providers: [CheckInService, CheckInGateway],
  controllers: [CheckInController],
})
export class CheckInModule {}