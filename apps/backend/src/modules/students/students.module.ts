import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from '../../entities/student.entity';
import { Registration } from '../../entities/registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Registration])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
