import { Controller, Post, Delete, Body } from '@nestjs/common';
import { PushService } from './push.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  @Post('subscribe')
  @Auth()
  subscribe(@CurrentUser() user: { userId: string }, @Body() dto: SubscribeDto) {
    return this.pushService.subscribe(user.userId, dto);
  }

  @Delete('unsubscribe')
  @Auth()
  unsubscribe(@Body('endpoint') endpoint: string) {
    return this.pushService.unsubscribe(endpoint);
  }
}