import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { LectureContentService } from './lecture-content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { PaidRegistrationGuard } from './guards/paid-registration.guard';
import { CreateWeekDto } from './dto/create-week.dto';
import { UpdateWeekDto } from './dto/update-week.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ReorderContentDto } from './dto/reorder-content.dto';
import { FileUploadService } from '../../lib/services/file-upload.service';

@Controller()
export class LectureContentController {
  constructor(
    private readonly lectureContentService: LectureContentService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // ============ ADMIN: Week Management ============
  @Get('courses/:courseId/weeks')
  @UseGuards(JwtAuthGuard)
  async getWeeks(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req: any,
  ) {
    const isAdmin = req.user?.role === 'admin';
    return this.lectureContentService.getWeeksByCourse(courseId, isAdmin);
  }

  @Post('courses/:courseId/weeks')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async createWeek(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateWeekDto,
  ) {
    return this.lectureContentService.createWeek(courseId, dto);
  }

  @Get('courses/:courseId/weeks/:weekId')
  @UseGuards(JwtAuthGuard)
  async getWeek(@Param('weekId', ParseIntPipe) weekId: number) {
    return this.lectureContentService.getWeekById(weekId);
  }

  @Patch('courses/:courseId/weeks/:weekId')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async updateWeek(
    @Param('weekId', ParseIntPipe) weekId: number,
    @Body() dto: UpdateWeekDto,
  ) {
    return this.lectureContentService.updateWeek(weekId, dto);
  }

  @Delete('courses/:courseId/weeks/:weekId')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async deleteWeek(@Param('weekId', ParseIntPipe) weekId: number) {
    await this.lectureContentService.deleteWeek(weekId);
    return { message: 'Week deleted successfully' };
  }

  // ============ ADMIN: Content Management ============
  @Get('weeks/:weekId/content')
  @UseGuards(JwtAuthGuard)
  async getContent(@Param('weekId', ParseIntPipe) weekId: number) {
    return this.lectureContentService.getContentByWeek(weekId);
  }

  @Post('weeks/:weekId/content')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async createContent(
    @Param('weekId', ParseIntPipe) weekId: number,
    @Body() dto: CreateContentDto,
  ) {
    return this.lectureContentService.createContent(weekId, dto);
  }

  @Get('content/:contentId')
  @UseGuards(JwtAuthGuard)
  async getContentById(@Param('contentId', ParseIntPipe) contentId: number) {
    const content = await this.lectureContentService['contentRepository'].findOne({
      where: { id: contentId },
    });
    if (!content) {
      throw new Error('Content not found');
    }
    return content;
  }

  @Patch('content/:contentId')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async updateContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: UpdateContentDto,
  ) {
    return this.lectureContentService.updateContent(contentId, dto);
  }

  @Delete('content/:contentId')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async deleteContent(@Param('contentId', ParseIntPipe) contentId: number) {
    await this.lectureContentService.deleteContent(contentId);
    return { message: 'Content deleted successfully' };
  }

  @Patch('weeks/:weekId/content/reorder')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async reorderContent(
    @Param('weekId', ParseIntPipe) weekId: number,
    @Body() dto: ReorderContentDto,
  ) {
    return this.lectureContentService.reorderContent(weekId, dto);
  }

  // ============ FILE UPLOAD ============
  @Post('content/upload')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async uploadFile(@Request() req: any) {
    const data = await req.file();
    const courseId = parseInt(data.fields.courseId?.value, 10);
    const weekId = parseInt(data.fields.weekId?.value, 10);

    if (!courseId || !weekId) {
      throw new Error('courseId and weekId are required');
    }

    return this.fileUploadService.uploadFile(data, courseId, weekId);
  }

  // ============ STUDENT: Content Access ============
  @Get('courses/:courseId/content')
  @UseGuards(JwtAuthGuard, PaidRegistrationGuard)
  async getCourseContent(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req: any,
  ) {
    const studentId = req.user.studentId;
    return this.lectureContentService.getCourseContent(courseId, studentId);
  }

  // ============ STUDENT: Progress Tracking ============
  @Post('content/:contentId/progress')
  @UseGuards(JwtAuthGuard)
  async markComplete(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Request() req: any,
  ) {
    const studentId = req.user.studentId;
    return this.lectureContentService.markContentComplete(studentId, contentId);
  }

  @Delete('content/:contentId/progress')
  @UseGuards(JwtAuthGuard)
  async removeProgress(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Request() req: any,
  ) {
    const studentId = req.user.studentId;
    await this.lectureContentService.removeContentProgress(
      studentId,
      contentId,
    );
    return { message: 'Progress removed' };
  }

  @Get('courses/:courseId/progress')
  @UseGuards(JwtAuthGuard, PaidRegistrationGuard)
  async getProgressSummary(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req: any,
  ) {
    const studentId = req.user.studentId;
    return this.lectureContentService.getProgressSummary(studentId, courseId);
  }
}
