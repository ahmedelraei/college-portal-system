import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.studentsService.findAll(pageNumber, limitNumber, search);
  }

  @Get('me')
  getProfile(@Request() req) {
    return this.studentsService.findOne(this.getStudentId(req));
  }

  @Get('me/transcript')
  getMyTranscript(@Request() req) {
    return this.studentsService.getTranscript(this.getStudentId(req));
  }

  @Get('me/statistics')
  getMyStatistics(@Request() req) {
    return this.studentsService.getStudentStatistics(this.getStudentId(req));
  }

  @Get('me/gpa')
  getCurrentSemesterGPA(
    @Request() req,
    @Query('semester') semester: string,
    @Query('year') year: number,
  ) {
    return this.studentsService.getCurrentSemesterGPA(
      this.getStudentId(req),
      semester,
      year,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id/transcript')
  getTranscript(@Param('id') id: string) {
    return this.studentsService.getTranscript(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.studentsService.getStudentStatistics(+id);
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(
      this.getStudentId(req),
      updateStudentDto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }

  private getStudentId(req: { user?: { student?: { id?: number } } }): number {
    const studentId = req.user?.student?.id;
    if (!studentId) {
      throw new NotFoundException('Student record not found');
    }
    return studentId;
  }
}
