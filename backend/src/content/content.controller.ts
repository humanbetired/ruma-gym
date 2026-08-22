import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { galleryImageMulterConfig } from 'src/common/config/multer.config';
import { processAndSaveImage } from '../common/utils/image.util';
import { join } from 'path';



@Controller()
export class ContentController {
  constructor(private contentService: ContentService) {}

// Public

  @Get('facilities')
  findAllFacilitiesPublic() {
    return this.contentService.findAllFacilities(false);
  }

  @Get('gallery')
  findAllGalleryPublic(@Query('category') category?: string) {
    return this.contentService.findAllGalleryImages(category);
  }

//   Private

  @Get('admin/facilities')
  @Auth('ADMIN', 'OWNER')
  findAllFacilitiesAdmin() {
    return this.contentService.findAllFacilities(true);
  }

  @Post('admin/facilities')
  @Auth('ADMIN', 'OWNER')
  createFacility(@Body() dto: CreateFacilityDto) {
    return this.contentService.createFacility(dto);
  }

  @Patch('admin/facilities/:id')
  @Auth('ADMIN', 'OWNER')
  updateFacility(@Param('id') id: string, @Body() dto: UpdateFacilityDto) {
    return this.contentService.updateFacility(id, dto);
  }

  @Delete('admin/facilities/:id')
  @Auth('ADMIN', 'OWNER')
  removeFacility(@Param('id') id: string) {
    return this.contentService.removeFacility(id);
  }  
  
  @Post('admin/gallery')
  @Auth('ADMIN', 'OWNER')
  @UseInterceptors(FileInterceptor('image', galleryImageMulterConfig))
  async createGalleryImage(
    @Body() dto: CreateGalleryImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filename = await processAndSaveImage(
      file.buffer,
      join(process.cwd(), 'uploads', 'gallery'),
      { maxWidth: 1600, quality: 80 }, 
    );

    const imageUrl = `/uploads/gallery/${filename}`;
    return this.contentService.createGalleryImage({ ...dto, imageUrl });
  }

  @Patch('admin/gallery/:id')
  @Auth('ADMIN', 'OWNER')
  updateGalleryImage(@Param('id') id: string, @Body() dto: UpdateGalleryImageDto) {
    return this.contentService.updateGalleryImage(id, dto);
  }

  @Delete('admin/gallery/:id')
  @Auth('ADMIN', 'OWNER')
  removeGalleryImage(@Param('id') id: string) {
    return this.contentService.removeGalleryImage(id);
  }

  @Patch('admin/facilities/:id/restore')
  @Auth('ADMIN', 'OWNER')
  restoreFacility(@Param('id') id: string) {
    return this.contentService.restoreFacility(id);
  }
}