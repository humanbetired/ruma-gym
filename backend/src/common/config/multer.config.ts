import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

const imageFileFilter = (allowedMimes: string[]) => (req: any, file: any, callback: any) => {
  if (!allowedMimes.includes(file.mimetype)) {
    return callback(
      new BadRequestException(`Hanya file ${allowedMimes.map((m) => m.split('/')[1]).join('/')} yang diperbolehkan`),
      false,
    );
  }
  callback(null, true);
};

export const paymentProofMulterConfig = {
  storage: memoryStorage(),
  fileFilter: imageFileFilter(['image/jpeg', 'image/png', 'image/jpg']),
  limits: { fileSize: 5 * 1024 * 1024 },
};

export const galleryImageMulterConfig = {
  storage: memoryStorage(),
  fileFilter: imageFileFilter(['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
  limits: { fileSize: 5 * 1024 * 1024 },
};

export const trainerPhotoMulterConfig = {
  storage: memoryStorage(),
  fileFilter: imageFileFilter(['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
  limits: { fileSize: 5 * 1024 * 1024 },
};