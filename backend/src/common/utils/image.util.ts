import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface ProcessImageOptions {
  maxWidth: number;
  quality?: number;
}

export async function processAndSaveImage(
  buffer: Buffer,
  destinationFolder: string,
  options: ProcessImageOptions,
): Promise<string> {
  const { maxWidth, quality = 80 } = options;

  await mkdir(destinationFolder, { recursive: true });

  const filename = `${uuidv4()}.webp`;
  const filePath = join(destinationFolder, filename);

  await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(filePath);

  return filename;
}