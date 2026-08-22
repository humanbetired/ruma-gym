import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async createFacility(data: { name: string; description?: string; sortOrder?: number }) {
    return this.prisma.facility.create({ data });
  }

  async findAllFacilities(includeInactive = false) {
    return this.prisma.facility.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateFacility(id: string, data: { name?: string; description?: string; sortOrder?: number }) {
    await this.ensureFacilityExists(id);
    return this.prisma.facility.update({ where: { id }, data });
  }

  async removeFacility(id: string) {
    await this.ensureFacilityExists(id);
    return this.prisma.facility.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async ensureFacilityExists(id: string) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) {
      throw new NotFoundException('Fasilitas tidak ditemukan');
    }
  }

  
  async createGalleryImage(data: {
    imageUrl: string;
    caption?: string;
    category?: string;
    sortOrder?: number;
  }) {
    return this.prisma.galleryImage.create({ data });
  }

  async findAllGalleryImages(category?: string) {
    return this.prisma.galleryImage.findMany({
      where: category ? { category } : {},
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateGalleryImage(
    id: string,
    data: { caption?: string; category?: string; sortOrder?: number },
  ) {
    await this.ensureGalleryImageExists(id);
    return this.prisma.galleryImage.update({ where: { id }, data });
  }

  async removeGalleryImage(id: string) {
    await this.ensureGalleryImageExists(id);
    return this.prisma.galleryImage.delete({ where: { id } });
  }

  private async ensureGalleryImageExists(id: string) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException('Gambar galeri tidak ditemukan');
    }
  }

  async restoreFacility(id: string) {
  await this.ensureFacilityExists(id);
  return this.prisma.facility.update({
    where: { id },
    data: { isActive: true },
  });
}
}