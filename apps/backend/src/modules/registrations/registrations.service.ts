import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Registration,
  PaymentStatus,
  Grade,
} from '../../entities/registration.entity';
import { Course } from '../../entities/course.entity';
import { Student } from '../../entities/student.entity';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { BulkRegistrationDto } from './dto/bulk-registration.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private registrationsRepository: Repository<Registration>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private coursesService: CoursesService,
    private studentsService: StudentsService,
    private systemSettingsService: SystemSettingsService,
    private whatsappService: WhatsappService,
  ) {}

  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    const { studentId, courseId, semester, year } = createRegistrationDto;

    // Check if registration is enabled
    const isRegistrationEnabled =
      await this.systemSettingsService.isRegistrationEnabled();
    if (!isRegistrationEnabled) {
      throw new ForbiddenException(
        'Course registration is currently disabled by the administration. Please check back later.',
      );
    }

    // Check if student exists
    await this.studentsService.findOne(studentId);

    // Check if course exists
    const course = await this.coursesService.findOne(courseId);

    // Check if already registered
    const existingRegistration = await this.registrationsRepository.findOne({
      where: { studentId, courseId, semester, year, isDropped: false },
    });

    if (existingRegistration) {
      throw new ConflictException(
        'Student is already registered for this course',
      );
    }

    // Check prerequisites
    const prerequisiteCheck = await this.coursesService.checkPrerequisites(
      studentId,
      courseId,
    );
    if (!prerequisiteCheck.canRegister) {
      throw new BadRequestException(
        `Missing prerequisites: ${prerequisiteCheck.missingPrerequisites.map((p) => p.courseName).join(', ')}`,
      );
    }

    // Check credit hour limit (18 credits max per semester)
    const currentCreditHours = await this.getCurrentSemesterCreditHours(
      studentId,
      semester,
      year,
    );
    if (currentCreditHours + course.creditHours > 18) {
      throw new BadRequestException(
        'Cannot exceed 18 credit hours per semester',
      );
    }

    // Create registration
    const registration = this.registrationsRepository.create({
      studentId,
      courseId,
      semester,
      year,
      paymentStatus: PaymentStatus.PAID, // Auto-approve since no payment system is implemented
    });

    return this.registrationsRepository.save(registration);
  }

  async bulkRegister(
    studentId: number,
    bulkRegistrationDto: BulkRegistrationDto,
  ): Promise<Registration[]> {
    const { courseIds, semester, year } = bulkRegistrationDto;

    // Check if registration is enabled
    const isRegistrationEnabled =
      await this.systemSettingsService.isRegistrationEnabled();
    if (!isRegistrationEnabled) {
      throw new ForbiddenException(
        'Course registration is currently disabled by the administration. Please check back later.',
      );
    }

    // Get courses
    const courses = await this.coursesRepository.find({
      where: { id: In(courseIds) },
    });

    if (courses.length !== courseIds.length) {
      throw new NotFoundException('One or more courses not found');
    }

    // Calculate total credit hours
    const totalCreditHours = courses.reduce(
      (sum, course) => sum + course.creditHours,
      0,
    );

    // Check current semester credit hours
    const currentCreditHours = await this.getCurrentSemesterCreditHours(
      studentId,
      semester,
      year,
    );

    if (currentCreditHours + totalCreditHours > 18) {
      throw new BadRequestException(
        'Total credit hours would exceed 18 credits per semester',
      );
    }

    // Check prerequisites for all courses
    const prerequisiteChecks = await Promise.all(
      courseIds.map((courseId) =>
        this.coursesService.checkPrerequisites(studentId, courseId),
      ),
    );

    const coursesWithMissingPrereqs = prerequisiteChecks
      .map((check, index) => ({ check, course: courses[index] }))
      .filter(({ check }) => !check.canRegister);

    if (coursesWithMissingPrereqs.length > 0) {
      const errorMessage = coursesWithMissingPrereqs
        .map(
          ({ course, check }) =>
            `${course.courseName}: Missing ${check.missingPrerequisites.map((p) => p.courseName).join(', ')}`,
        )
        .join('; ');

      throw new BadRequestException(`Prerequisites not met: ${errorMessage}`);
    }

    // Create all registrations
    const registrations = courseIds.map((courseId) =>
      this.registrationsRepository.create({
        studentId,
        courseId,
        semester,
        year,
        paymentStatus: bulkRegistrationDto.isPaid !== false ? PaymentStatus.PAID : PaymentStatus.PENDING,
      }),
    );

    const savedRegistrations =
      await this.registrationsRepository.save(registrations);

    // Reload with course relation
    return this.registrationsRepository.find({
      where: {
        id: In(savedRegistrations.map((r) => r.id)),
      },
      relations: ['course'],
    });
  }

  async findAll(
    studentId?: number,
    semester?: string,
    year?: number,
  ): Promise<Registration[]> {
    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (semester) where.semester = semester;
    if (year) where.year = year;

    return this.registrationsRepository.find({
      where,
      relations: ['course', 'student'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Registration[]> {
    return this.registrationsRepository.find({
      where: { studentId, isDropped: false },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudentAndSemester(
    studentId: number,
    semester: string,
    year: number,
  ): Promise<Registration[]> {
    return this.registrationsRepository.find({
      where: { studentId, semester, year, isDropped: false },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Registration> {
    const registration = await this.registrationsRepository.findOne({
      where: { id },
      relations: ['course', 'student'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async update(
    id: number,
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<Registration> {
    const registration = await this.findOne(id);

    // If updating grade, calculate grade points and mark as completed
    if (updateRegistrationDto.grade) {
      registration.grade = updateRegistrationDto.grade;
      registration.gradePoints = registration.calculateGradePoints();
      registration.isCompleted = true;

      // Update student's GPA
      await this.studentsService.updateGPA(registration.studentId);
    }

    Object.assign(registration, updateRegistrationDto);
    const savedRegistration =
      await this.registrationsRepository.save(registration);

    // Send WhatsApp notification when a grade is assigned
    if (updateRegistrationDto.grade) {
      const fullRegistration = await this.registrationsRepository.findOne({
        where: { id: savedRegistration.id },
        relations: ['course', 'student', 'student.user'],
      });

      if (!fullRegistration) {
        return savedRegistration;
      }

      const studentUser = fullRegistration.student?.user;
      if (studentUser?.phoneNumber) {
        this.whatsappService.sendGradeNotification({
          phoneNumber: studentUser.phoneNumber,
          studentName: studentUser.firstName,
          courseName: fullRegistration.course.courseName,
          courseCode: fullRegistration.course.courseCode,
          grade: updateRegistrationDto.grade,
          gradePoints: savedRegistration.gradePoints,
        });
      } else {
        console.log(
          `[update] No phone number for student ${registration.studentId} — skipping WhatsApp notification`,
        );
      }

      return fullRegistration;
    }

    return savedRegistration;
  }

  async drop(id: number): Promise<Registration> {
    const registration = await this.findOne(id);

    if (registration.isCompleted) {
      throw new BadRequestException('Cannot drop completed course');
    }

    // Check if within refund period (1 week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const canRefund = registration.createdAt > oneWeekAgo;

    registration.isDropped = true;
    registration.droppedAt = new Date();

    if (canRefund && registration.paymentStatus === PaymentStatus.PAID) {
      registration.paymentStatus = PaymentStatus.REFUNDED;
    }

    return this.registrationsRepository.save(registration);
  }

  async updatePaymentStatus(
    id: number,
    paymentStatus: PaymentStatus,
  ): Promise<Registration> {
    const registration = await this.findOne(id);
    registration.paymentStatus = paymentStatus;
    return this.registrationsRepository.save(registration);
  }

  async getStudentRegistrations(
    studentId: number,
    semester?: string,
    year?: number,
  ): Promise<Registration[]> {
    const where: any = { studentId, isDropped: false };

    if (semester) where.semester = semester;
    if (year) where.year = year;

    return this.registrationsRepository.find({
      where,
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async assignGrade(
    registrationId: number,
    grade: Grade,
  ): Promise<Registration> {
    const registration = await this.findOne(registrationId);

    console.log(
      `[assignGrade] Assigning grade ${grade} to registration ${registrationId} for student ${registration.studentId}`,
    );

    // Set the grade
    registration.grade = grade;

    // Calculate grade points based on the grade
    const gradePointMap = {
      [Grade.A]: 4.0,
      [Grade.B]: 3.0,
      [Grade.C]: 2.0,
      [Grade.D]: 1.0,
      [Grade.F]: 0.0,
      [Grade.INCOMPLETE]: 0.0,
      [Grade.WITHDRAW]: null,
    };

    registration.gradePoints = gradePointMap[grade];
    console.log(`[assignGrade] Grade points: ${registration.gradePoints}`);

    // Mark as completed if not a withdrawal
    if (grade !== Grade.WITHDRAW && grade !== Grade.INCOMPLETE) {
      registration.isCompleted = true;
    }

    // Save the registration
    const updatedRegistration =
      await this.registrationsRepository.save(registration);
    console.log(
      `[assignGrade] Registration saved with grade ${updatedRegistration.grade}`,
    );

    // Update student's GPA
    console.log(
      `[assignGrade] Updating GPA for student ${registration.studentId}`,
    );
    await this.studentsService.updateGPA(registration.studentId);
    console.log(`[assignGrade] GPA update completed`);

    // Reload registration with student to get updated GPA
    const reloadedRegistration = await this.registrationsRepository.findOne({
      where: { id: updatedRegistration.id },
      relations: ['course', 'student', 'student.user'],
    });

    if (!reloadedRegistration) {
      throw new NotFoundException('Registration not found after update');
    }

    // Send WhatsApp notification to student (fire-and-forget)
    const studentUser = reloadedRegistration.student?.user;
    if (studentUser?.phoneNumber) {
      this.whatsappService.sendGradeNotification({
        phoneNumber: studentUser.phoneNumber,
        studentName: studentUser.firstName,
        courseName: reloadedRegistration.course.courseName,
        courseCode: reloadedRegistration.course.courseCode,
        grade: grade,
        gradePoints: reloadedRegistration.gradePoints,
      });
    } else {
      console.log(
        `[assignGrade] No phone number for student ${registration.studentId} — skipping WhatsApp notification`,
      );
    }

    return reloadedRegistration;
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return this.registrationsRepository.find({
      relations: ['course', 'student', 'student.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCurrentSemesterCreditHours(
    studentId: number,
    semester: string,
    year: number,
  ): Promise<number> {
    const result = await this.registrationsRepository
      .createQueryBuilder('registration')
      .leftJoin('registration.course', 'course')
      .select('SUM(course.creditHours)', 'total')
      .where('registration.studentId = :studentId', { studentId })
      .andWhere('registration.semester = :semester', { semester })
      .andWhere('registration.year = :year', { year })
      .andWhere('registration.isDropped = false')
      .getRawOne();

    return parseInt(result?.total) || 0;
  }

  async getRegistrationSummary(
    studentId: number,
    semester: string,
    year: number,
  ) {
    const registrations = await this.getStudentRegistrations(
      studentId,
      semester,
      year,
    );

    const totalCreditHours = registrations.reduce(
      (sum, reg) => sum + reg.course.creditHours,
      0,
    );
    const totalCost = registrations.reduce(
      (sum, reg) => sum + reg.course.totalCost,
      0,
    );

    const paymentStatusCounts = registrations.reduce(
      (counts, reg) => {
        counts[reg.paymentStatus] = (counts[reg.paymentStatus] || 0) + 1;
        return counts;
      },
      {} as Record<PaymentStatus, number>,
    );

    return {
      registrations,
      summary: {
        totalCourses: registrations.length,
        totalCreditHours,
        totalCost,
        paymentStatusCounts,
      },
    };
  }
}
