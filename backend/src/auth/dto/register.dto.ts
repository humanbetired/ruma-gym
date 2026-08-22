import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/(?=.*[a-z])/, { message: 'Password harus mengandung huruf kecil' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password harus mengandung huruf besar' })
  @Matches(/(?=.*\d)/, { message: 'Password harus mengandung angka' })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: 'Password harus mengandung karakter spesial' })
  password!: string;

  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}