import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureContentController } from './lecture-content.controller';
import { LectureContentService } from './lecture-content.service';
import { Week } from '../../entities/week.entity';
import { LectureContent } from '../../entities/lecture-content.entity';
import { ContentProgress } from '../../entities/content-progress.entity';
import { Registration } from '../../entities/registration.entity';
import { FileUploadService } from '../../lib/services/file-upload.service';
import { PaidRegistrationGuard } from './guards/paid-registration.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Week,
      LectureContent,
      ContentProgress,
      Registration,
    ]),
  ],
  controllers: [LectureContentController],
  providers: [LectureContentService, FileUploadService, PaidRegistrationGuard],
  exports: [LectureContentService],
})
export class LectureContentModule {}
