import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  onModuleInit() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error('GMAIL_USER dan GMAIL_APP_PASSWORD belum diset di .env');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(to: string, fullName: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Ruma Gym" <${process.env.GMAIL_USER}>`,
        to,
        subject: `Verifikasi Email Kamu ${fullName} di Ruma Gym`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #003399;">Halo, ${fullName}!</h2>
            <p>Terima kasih sudah mendaftar di Ganesha Gym. Klik tombol di bawah untuk verifikasi emailmu:</p>
            <a href="${verifyUrl}" style="display: inline-block; background: #003399; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Verifikasi Email
            </a>
            <p style="color: #767676; font-size: 14px;">Link ini berlaku selama 24 jam. Kalau kamu tidak merasa mendaftar, abaikan email ini.</p>
          </div>
        `,
      });
      this.logger.log(`Email verifikasi terkirim ke ${to}`);
    } catch (error) {
      this.logger.error(`Gagal kirim email ke ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, fullName: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await this.transporter.sendMail({
      from: `"Ruma Gym" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Reset Password Kamu di Ruma Gym',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #003399;">Halo, ${fullName}!</h2>
          <p>Kami menerima permintaan untuk mengatur ulang password akunmu. Klik tombol di bawah untuk membuat password baru:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #003399; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #767676; font-size: 14px;">Link ini berlaku selama 1 jam. Kalau kamu tidak meminta ini, abaikan email ini. Password kamu tetap aman.</p>
        </div>
      `,
    });
    this.logger.log(`Email reset password terkirim ke ${to}`);
  } catch (error) {
    this.logger.error(`Gagal kirim email reset ke ${to}: ${error.message}`);
    throw error;
    }
  }
}