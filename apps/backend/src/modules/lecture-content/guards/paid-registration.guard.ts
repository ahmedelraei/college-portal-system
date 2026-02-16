import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, PaymentStatus } from '../../../entities/registration.entity';

@Injectable()
export class PaidRegistrationGuard implements CanActivate {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request?.user ?? request?.session?.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Admins can access all course content
    if (user.role === 'admin') {
      return true;
    }

    // Extract courseId from request params or body
    const courseId = parseInt(request.params.courseId, 10);

    if (!courseId) {
      throw new ForbiddenException('Course ID is required');
    }

    // The registrations table's studentId references Student.id (not User.id)
    // user.student.id is the Student table's primary key
    // user.id is the User table's primary key
    // user.studentId is the college ID number
    const studentId = user.student?.id;
    
    if (!studentId) {
      throw new ForbiddenException('Student record not found');
    }
    
    console.log('[PaidRegistrationGuard] Checking access:', {
      userTableId: user.id,
      studentTableId: studentId,
      collegeStudentId: user.studentId,
      courseId: courseId,
      userRole: user.role,
    });

    // Check if student has a paid registration for this course
    const registration = await this.registrationRepository.findOne({
      where: {
        studentId: studentId,
        courseId: courseId,
        paymentStatus: PaymentStatus.PAID,
        isDropped: false,
      },
    });

    console.log('[PaidRegistrationGuard] Registration found:', registration ? 'YES' : 'NO');
    if (registration) {
      console.log('[PaidRegistrationGuard] Registration details:', {
        id: registration.id,
        paymentStatus: registration.paymentStatus,
        isDropped: registration.isDropped,
      });
    }

    if (!registration) {
      // Try to find any registration for debugging
      const anyReg = await this.registrationRepository.findOne({
        where: {
          studentId: studentId,
          courseId: courseId,
        },
      });
      
      console.log('[PaidRegistrationGuard] Any registration found:', anyReg ? {
        id: anyReg.id,
        paymentStatus: anyReg.paymentStatus,
        isDropped: anyReg.isDropped,
      } : 'NONE');
      
      throw new ForbiddenException(
        'Access denied. You must have a paid registration for this course to access its content.',
      );
    }

    // Attach registration to request for later use
    request.registration = registration;

    return true;
  }
}
