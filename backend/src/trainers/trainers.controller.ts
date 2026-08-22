import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainersService } from './trainers.service';
import { CreateTrainerProfileDto } from './dto/create-trainer-profile.dto';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { trainerPhotoMulterConfig } from '../common/config/multer.config';
import { processAndSaveImage } from 'src/common/utils/image.util';
import { join } from 'path';

@Controller('trainers')
export class TrainersController {
  constructor(private trainersService: TrainersService) {}

  @Get()
  findAllPublic() {
    return this.trainersService.findAllPublic();
  }

  @Get('me')
  @Auth('PERSONAL_TRAINER')
  findMyProfile(@CurrentUser() user: { userId: string }) {
    return this.trainersService.findByUserId(user.userId);
  }

  @Patch('me')
  @Auth('PERSONAL_TRAINER')
  async updateMyProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateOwnProfileDto,
  ) {
    const trainer = await this.trainersService.findByUserId(user.userId);
    return this.trainersService.updateOwnProfile(trainer.id, user.userId, dto);
  }

  @Post('me/photo')
  @Auth('PERSONAL_TRAINER')
  @UseInterceptors(FileInterceptor('photo', trainerPhotoMulterConfig))
  async uploadMyPhoto(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const trainer = await this.trainersService.findByUserId(user.userId);

    const filename = await processAndSaveImage(
      file.buffer,
      join(process.cwd(), 'uploads', 'trainer-photos'),
      { maxWidth: 600, quality: 80 },
    );

    const photoUrl = `/uploads/trainer-photos/${filename}`;
    return this.trainersService.updateOwnProfile(trainer.id, user.userId, { photoUrl });
  }

  @Get('me/schedules')
  @Auth('PERSONAL_TRAINER')
  async findMySchedules(@CurrentUser() user: { userId: string }) {
    const trainer = await this.trainersService.findByUserId(user.userId);
    return this.trainersService.findSchedulesByTrainer(trainer.id);
  }

  @Post('me/schedules')
  @Auth('PERSONAL_TRAINER')
  async createSchedule(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateScheduleDto,
  ) {
    const trainer = await this.trainersService.findByUserId(user.userId);
    return this.trainersService.createSchedule(trainer.id, dto);
  }

  @Delete('me/schedules/:scheduleId')
  @Auth('PERSONAL_TRAINER')
  async removeMySchedule(
    @CurrentUser() user: { userId: string },
    @Param('scheduleId') scheduleId: string,
  ) {
    const trainer = await this.trainersService.findByUserId(user.userId);
    return this.trainersService.removeSchedule(scheduleId, trainer.id);
  }

  @Get(':id/schedules')
  @Auth()
  findSchedulesPublic(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.trainersService.findSchedulesByTrainer(id, true, user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainersService.findOne(id);
  }

  @Post()
  @Auth('ADMIN', 'OWNER')
  create(@Body() dto: CreateTrainerProfileDto) {
    return this.trainersService.createProfile(dto);
  }

  @Patch(':id')
  @Auth('ADMIN', 'OWNER')
  update(@Param('id') id: string, @Body() dto: UpdateTrainerProfileDto) {
    return this.trainersService.update(id, dto);
  }
}