import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from '../../entities/course.entity';
import { Registration } from '../../entities/registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Registration])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
