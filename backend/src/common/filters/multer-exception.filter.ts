import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

const MULTER_ERROR_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: 'Ukuran file terlalu besar. Maksimal 5MB.',
  LIMIT_UNEXPECTED_FILE: 'Field file tidak sesuai atau jumlah file melebihi batas.',
};

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message =
      MULTER_ERROR_MESSAGES[exception.code] ?? 'Gagal mengunggah file. Silakan coba lagi.';
    const badRequest = new BadRequestException(message);
    const body = badRequest.getResponse();

    response.status(400).json(body);
  }
}