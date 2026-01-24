import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Payment,
  PaymentType,
  PaymentStatus,
} from '../../entities/payment.entity';
import {
  Registration,
  PaymentStatus as RegistrationPaymentStatus,
} from '../../entities/registration.entity';
import { Student } from '../../entities/student.entity';
import { RegistrationsService } from '../registrations/registrations.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Registration)
    private registrationsRepository: Repository<Registration>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private registrationsService: RegistrationsService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { studentId, registrationIds, method } = createPaymentDto;

    // Verify student exists
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get registrations and calculate total amount
    const registrations = await this.registrationsRepository.find({
      where: { id: In(registrationIds), studentId },
      relations: ['course'],
    });

    if (registrations.length !== registrationIds.length) {
      throw new NotFoundException('One or more registrations not found');
    }

    // Check if any registration is already paid
    const alreadyPaidRegistrations = registrations.filter(
      (reg) => reg.paymentStatus === RegistrationPaymentStatus.PAID,
    );

    if (alreadyPaidRegistrations.length > 0) {
      throw new BadRequestException('Some courses are already paid for');
    }

    // Calculate total amount
    const totalAmount = registrations.reduce(
      (sum, reg) => sum + reg.course.totalCost,
      0,
    );

    // Create payment record
    const payment = this.paymentsRepository.create({
      studentId,
      amount: totalAmount,
      type: PaymentType.TUITION,
      method,
      status: PaymentStatus.PENDING,
      description: `Tuition payment for ${registrations.length} course(s)`,
      metadata: {
        registrationIds,
        courses: registrations.map((reg) => ({
          id: reg.course.id,
          code: reg.course.courseCode,
          name: reg.course.courseName,
          cost: reg.course.totalCost,
        })),
      },
    });

    return this.paymentsRepository.save(payment);
  }

  async processPayment(
    id: number,
    processPaymentDto: ProcessPaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    // Simulate payment processing
    const isSuccessful =
      await this.simulatePaymentProcessing(processPaymentDto);

    if (isSuccessful) {
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = this.generateTransactionId();
      payment.processedAt = new Date();

      // Update registration payment statuses
      const registrationIds = payment.metadata?.registrationIds || [];
      await this.registrationsRepository.update(
        { id: In(registrationIds) },
        { paymentStatus: RegistrationPaymentStatus.PAID },
      );
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason =
        processPaymentDto.failureReason || 'Payment processing failed';
    }

    return this.paymentsRepository.save(payment);
  }

  async findAll(studentId?: number): Promise<Payment[]> {
    const where: any = {};
    if (studentId) where.studentId = studentId;

    return this.paymentsRepository.find({
      where,
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getStudentPayments(studentId: number): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentHistory(studentId: number) {
    const payments = await this.getStudentPayments(studentId);

    const totalPaid = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
      .filter((p) => p.status === PaymentStatus.PENDING)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      payments,
      summary: {
        totalPayments: payments.length,
        totalPaid,
        totalPending,
        totalFailed: payments.filter((p) => p.status === PaymentStatus.FAILED)
          .length,
      },
    };
  }

  async refundPayment(id: number, reason: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    // Create refund payment record
    const refund = this.paymentsRepository.create({
      studentId: payment.studentId,
      amount: -payment.amount, // Negative amount for refund
      type: PaymentType.REFUND,
      method: payment.method,
      status: PaymentStatus.COMPLETED,
      description: `Refund for payment ${payment.id}`,
      metadata: {
        originalPaymentId: payment.id,
        reason,
      },
      processedAt: new Date(),
      transactionId: this.generateTransactionId(),
    });

    // Update original payment status
    payment.status = PaymentStatus.REFUNDED;

    // Update registration payment statuses if applicable
    const registrationIds = payment.metadata?.registrationIds || [];
    if (registrationIds.length > 0) {
      await this.registrationsRepository.update(
        { id: In(registrationIds) },
        { paymentStatus: RegistrationPaymentStatus.REFUNDED },
      );
    }

    await this.paymentsRepository.save(payment);
    return this.paymentsRepository.save(refund);
  }

  private async simulatePaymentProcessing(
    processPaymentDto: ProcessPaymentDto,
  ): Promise<boolean> {
    const { cardNumber, expiryDate, cvv } = processPaymentDto;

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock payment validation
    if (cardNumber === '4000000000000002') {
      return false; // Simulate declined card
    }

    if (cvv === '000') {
      return false; // Simulate invalid CVV
    }

    if (new Date(expiryDate) < new Date()) {
      return false; // Simulate expired card
    }

    // Simulate random failures (5% failure rate)
    return Math.random() > 0.05;
  }

  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  async getPaymentStatistics() {
    const totalPayments = await this.paymentsRepository.count();

    const completedPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.COMPLETED },
    });

    const totalRevenue = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.type = :type', { type: PaymentType.TUITION })
      .getRawOne();

    const pendingPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.PENDING },
    });

    const failedPayments = await this.paymentsRepository.count({
      where: { status: PaymentStatus.FAILED },
    });

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalRevenue: parseFloat(totalRevenue?.total) || 0,
      successRate:
        totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
    };
  }
}
