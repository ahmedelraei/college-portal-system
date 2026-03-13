import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { Course } from '../../entities/course.entity';
import { Week } from '../../entities/week.entity';
import { LectureContent } from '../../entities/lecture-content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Week, LectureContent]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
