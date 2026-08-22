import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RolesGuard } from './guards/roles.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UsersModule, JwtModule.register({}), MailModule],
  providers: [AuthService, JwtStrategy, GoogleStrategy, RolesGuard],
  controllers: [AuthController],
})
export class AuthModule {}