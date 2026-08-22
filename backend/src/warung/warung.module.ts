import { Module } from '@nestjs/common';
import { WarungService } from './warung.service';
import { WarungController } from './warung.controller';

@Module({
  providers: [WarungService],
  controllers: [WarungController],
})
export class WarungModule {}