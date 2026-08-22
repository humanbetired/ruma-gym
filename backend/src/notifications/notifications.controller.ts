import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('my')
  @Auth()
  findMy(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.findMyNotifications(user.userId);
  }

  @Patch(':id/read')
  @Auth()
  markAsRead(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.notificationsService.markAsRead(id, user.userId);
  }
}