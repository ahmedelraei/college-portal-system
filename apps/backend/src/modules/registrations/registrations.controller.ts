import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { BulkRegistrationDto } from './dto/bulk-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { PaymentStatus } from '../../entities/registration.entity';

@Controller('registrations')
@UseGuards(JwtAuthGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  create(@Body() createRegistrationDto: CreateRegistrationDto, @Request() req) {
    // Students can only register themselves
    if (req.user.role === UserRole.STUDENT) {
      createRegistrationDto.studentId = this.getStudentId(req);
    }
    return this.registrationsService.create(createRegistrationDto);
  }

  @Post('bulk')
  bulkRegister(
    @Body() bulkRegistrationDto: BulkRegistrationDto,
    @Request() req,
  ) {
    const studentId =
      req.user.role === UserRole.STUDENT
        ? this.getStudentId(req)
        : bulkRegistrationDto.studentId;

    if (!studentId) {
      throw new BadRequestException('studentId is required for admin users');
    }

    return this.registrationsService.bulkRegister(
      studentId,
      bulkRegistrationDto,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(
    @Query('studentId') studentId?: number,
    @Query('semester') semester?: string,
    @Query('year') year?: number,
  ) {
    return this.registrationsService.findAll(studentId, semester, year);
  }

  @Get('me')
  getMyRegistrations(
    @Request() req,
    @Query('semester') semester?: string,
    @Query('year') year?: number,
  ) {
    const studentId = this.getStudentId(req);
    return this.registrationsService.getStudentRegistrations(
      studentId,
      semester,
      year,
    );
  }

  @Get('me/summary')
  getMySummary(
    @Request() req,
    @Query('semester') semester: string,
    @Query('year') year: number,
  ) {
    const studentId = this.getStudentId(req);
    return this.registrationsService.getRegistrationSummary(
      studentId,
      semester,
      year,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('student/:studentId')
  getStudentRegistrations(
    @Param('studentId') studentId: string,
    @Query('semester') semester?: string,
    @Query('year') year?: number,
  ) {
    return this.registrationsService.getStudentRegistrations(
      +studentId,
      semester,
      year,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('student/:studentId/summary')
  getStudentSummary(
    @Param('studentId') studentId: string,
    @Query('semester') semester: string,
    @Query('year') year: number,
  ) {
    return this.registrationsService.getRegistrationSummary(
      +studentId,
      semester,
      year,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Students can only view their own registrations
    // This will be enforced in the service layer by checking ownership
    return this.registrationsService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.update(+id, updateRegistrationDto);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.registrationsService.updatePaymentStatus(+id, paymentStatus);
  }

  @Delete(':id/drop')
  drop(@Param('id') id: string) {
    // Students can only drop their own courses
    // This will be enforced in the service layer by checking ownership
    return this.registrationsService.drop(+id);
  }

  private getStudentId(req: { user?: { student?: { id?: number } } }): number {
    const studentId = req.user?.student?.id;
    if (!studentId) {
      throw new NotFoundException('Student record not found');
    }
    return studentId;
  }
}
