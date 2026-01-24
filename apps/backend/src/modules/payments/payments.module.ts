import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from '../../entities/payment.entity';
import { Registration } from '../../entities/registration.entity';
import { Student } from '../../entities/student.entity';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Registration, Student]),
    RegistrationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
