import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module'
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QrModule } from './qr/qr.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CheckInModule } from './check-in/check-in.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BullModule } from "@nestjs/bullmq"
import { ContentModule } from './content/content.module';
import { TrainersModule } from './trainers/trainers.module';
import { BookingsModule } from './bookings/bookings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PushModule } from './push/push.module';
import { MailModule } from './mail/mail.module';
import { DropInModule } from './drop-in/drop-in.module';
import { WarungModule } from './warung/warung.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule,
             ScheduleModule.forRoot(), QrModule, EventEmitterModule.forRoot(),
              CheckInModule, MembershipsModule, PaymentsModule, NotificationsModule,
            BullModule.forRoot({
              connection: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
              }
            }),
            ContentModule,
            TrainersModule,
            BookingsModule,
            AnalyticsModule,
            PushModule,
            MailModule,
            DropInModule,
            WarungModule,
            ThrottlerModule.forRoot([
              {
                name: 'default',
                ttl: 60000, 
                limit: 100,
              },
            ])],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})

export class AppModule {}