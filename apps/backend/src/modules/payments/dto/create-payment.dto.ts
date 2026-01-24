import { IsNumber, IsArray, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  studentId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  registrationIds: number[];

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
