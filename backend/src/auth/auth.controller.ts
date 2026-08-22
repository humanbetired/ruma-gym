import {
  Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { IsEmail } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from './cookie.util';
import { Throttle } from '@nestjs/throttler';
import { Auth } from './decorators/auth.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

class ResendVerificationDto {
  @IsEmail() email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.validateGoogleUser(req.user, this.meta(req));
    setRefreshTokenCookie(res, tokens.refreshToken);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?accessToken=${tokens.accessToken}`);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000} })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto, this.meta(req));
    setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedException('Refresh token tidak ditemukan');

    const tokens = await this.authService.refreshTokens(token, this.meta(req));
    setRefreshTokenCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @Auth()
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken;
    if (token) await this.authService.logout(token);
    clearRefreshTokenCookie(res);
    return { message: 'Logout berhasil' };
  }

  @Post('logout-all')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.userId);
    clearRefreshTokenCookie(res);
    return { message: 'Berhasil logout dari semua perangkat' };
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Throttle( { default: { limit: 3, ttl: 60000 }} )
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  @Auth()
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  private meta(req: Request) {
    return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
  }
}