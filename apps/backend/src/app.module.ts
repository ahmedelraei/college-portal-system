import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './lib/modules/db.module';
import { SeederModule } from './lib/modules/seeder.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { LectureContentModule } from './modules/lecture-content/lecture-content.module';

@Module({
  imports: [
    DatabaseModule,
    SeederModule,
    AuthModule,
    StudentsModule,
    CoursesModule,
    RegistrationsModule,
    PaymentsModule,
    SystemSettingsModule,
    LectureContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
