import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { Registration } from '../../entities/registration.entity';
import { Course } from '../../entities/course.entity';
import { Student } from '../../entities/student.entity';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/students.module';
import { AuthModule } from '../auth/auth.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Registration, Course, Student]),
    CoursesModule,
    StudentsModule,
    AuthModule,
    SystemSettingsModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
