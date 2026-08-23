export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_SIZE_LABEL = '5MB';

export function validateImageSize(file: File): string | null {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Ukuran gambar ${fileSizeMb}MB melebihi batas maksimal ${MAX_IMAGE_SIZE_LABEL}. Silakan pilih gambar yang lebih kecil.`;
  }
  return null;
}