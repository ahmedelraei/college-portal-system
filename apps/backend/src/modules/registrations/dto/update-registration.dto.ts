import { IsOptional, IsEnum } from 'class-validator';
import { PaymentStatus, Grade } from '../../../entities/registration.entity';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(Grade)
  grade?: Grade;
}
