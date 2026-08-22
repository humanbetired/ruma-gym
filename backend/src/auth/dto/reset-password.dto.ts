import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/(?=.*[a-z])/, { message: 'Password harus mengandung huruf kecil' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password harus mengandung huruf besar' })
  @Matches(/(?=.*\d)/, { message: 'Password harus mengandung angka' })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: 'Password harus mengandung karakter spesial' })
  newPassword: string;
}