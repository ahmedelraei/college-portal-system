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

    // Extract courseId from request params or body
    const courseId = parseInt(request.params.courseId, 10);

    if (!courseId) {
      throw new ForbiddenException('Course ID is required');
    }

    // Check if student has a paid registration for this course
    const registration = await this.registrationRepository.findOne({
      where: {
        studentId: user.studentId,
        courseId: courseId,
        paymentStatus: PaymentStatus.PAID,
      },
    });

    if (!registration) {
      throw new ForbiddenException(
        'Access denied. You must have a paid registration for this course to access its content.',
      );
    }

    // Attach registration to request for later use
    request.registration = registration;

    return true;
  }
}
