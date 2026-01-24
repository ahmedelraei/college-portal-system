import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request?.user ?? request?.session?.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    return true;
  }
}
