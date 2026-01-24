import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    // Students can only create payments for themselves
    if (req.user.role === UserRole.STUDENT) {
      createPaymentDto.studentId = this.getStudentId(req);
    }
    return this.paymentsService.create(createPaymentDto);
  }

  @Post(':id/process')
  processPayment(
    @Param('id') id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(+id, processPaymentDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query('studentId') studentId?: string) {
    return this.paymentsService.findAll(studentId ? +studentId : undefined);
  }

  @Get('me')
  getMyPayments(@Request() req) {
    return this.paymentsService.getStudentPayments(this.getStudentId(req));
  }

  @Get('me/history')
  getMyPaymentHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(this.getStudentId(req));
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('statistics')
  getStatistics() {
    return this.paymentsService.getPaymentStatistics();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('student/:studentId')
  getStudentPayments(@Param('studentId') studentId: string) {
    return this.paymentsService.getStudentPayments(+studentId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('student/:studentId/history')
  getStudentPaymentHistory(@Param('studentId') studentId: string) {
    return this.paymentsService.getPaymentHistory(+studentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/refund')
  refund(@Param('id') id: string, @Body('reason') reason: string) {
    return this.paymentsService.refundPayment(+id, reason);
  }

  private getStudentId(req: { user?: { student?: { id?: number } } }): number {
    const studentId = req.user?.student?.id;
    if (!studentId) {
      throw new NotFoundException('Student record not found');
    }
    return studentId;
  }
}
