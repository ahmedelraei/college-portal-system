import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() filters: CourseFilterDto, @Request() req) {
    const user = req.user;
    if (user?.role === UserRole.PROFESSOR) {
      return this.coursesService.findAll({ ...filters, professorId: user.id });
    }
    return this.coursesService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('code/:courseCode')
  findByCode(@Param('courseCode') courseCode: string) {
    return this.coursesService.findByCode(courseCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.coursesService.getCourseStatistics(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/prerequisites/check')
  checkPrerequisites(@Param('id') id: string, @Request() req) {
    const studentId = req.user?.student?.id;
    if (!studentId) {
      throw new NotFoundException('Student record not found');
    }
    return this.coursesService.checkPrerequisites(studentId, +id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}
