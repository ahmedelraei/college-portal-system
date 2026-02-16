import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate the JWT token using the parent class
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      return false;
    }

    // Then check if the user has admin role
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    return true;
  }
}
