import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { ScanQrDto } from './dto/scan-qr.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('check-in')
export class CheckInController {
  constructor(private checkInService: CheckInService) {}

  @Post('scan')
  @Auth()
  scan(@CurrentUser() user: { userId: string }, @Body() dto: ScanQrDto) {
    return this.checkInService.scan(user.userId, dto);
  }

  @Get('recent')
  @Auth('ADMIN', 'OWNER')
  findRecent(@Query('limit') limit?: string) {
    return this.checkInService.findRecent(limit ? Number(limit) : 20);
  }
}