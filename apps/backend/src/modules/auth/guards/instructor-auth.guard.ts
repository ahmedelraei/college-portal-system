import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class InstructorAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate the JWT token using the parent class
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow both admins and professors to act as instructors
    if (!user || (user.role !== 'admin' && user.role !== 'professor')) {
      throw new ForbiddenException(
        'Access denied. Instructor (admin or professor) privileges required.',
      );
    }

    return true;
  }
}

