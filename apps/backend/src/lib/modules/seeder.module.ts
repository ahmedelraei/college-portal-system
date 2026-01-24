import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeederService } from '../services/seeder.service';
import { User } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Course } from '../../entities/course.entity';
import { Week } from '../../entities/week.entity';
import { LectureContent } from '../../entities/lecture-content.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Student, Course, Week, LectureContent]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
