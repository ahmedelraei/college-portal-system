import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Student } from '../../entities/student.entity';
import { Registration, Grade } from '../../entities/registration.entity';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Registration)
    private registrationsRepository: Repository<Registration>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find({
      relations: ['user'],
      where: { user: { isActive: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['user', 'registrations', 'payments'],
    });

    if (!student || !student.user?.isActive) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.findOne(id);
    // Update the user entity, not the student entity
    if (student.user) {
      Object.assign(student.user, updateStudentDto);
      await this.studentsRepository.manager.save(student.user);
    }
    return student;
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    if (student.user) {
      student.user.isActive = false;
      await this.studentsRepository.manager.save(student.user);
    }
  }

  async getTranscript(id: number) {
    const student = await this.findOne(id);

    const registrations = await this.registrationsRepository.find({
      where: { studentId: id, isCompleted: true },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });

    // Calculate GPA
    const gpaData = this.calculateGPA(registrations);

    return {
      student,
      transcript: registrations.map((reg) => ({
        course: {
          id: reg.course.id,
          courseCode: reg.course.courseCode,
          courseName: reg.course.courseName,
          creditHours: reg.course.creditHours,
        },
        grade: reg.grade,
        gradePoints: reg.gradePoints,
        semester: reg.semester,
        year: reg.year,
        completedAt: reg.updatedAt,
      })),
      gpa: gpaData,
    };
  }

  async getCurrentSemesterGPA(
    id: number,
    semester: string,
    year: number,
  ): Promise<number> {
    const registrations = await this.registrationsRepository.find({
      where: {
        studentId: id,
        semester,
        year,
        isCompleted: true,
        grade: In([Grade.A, Grade.B, Grade.C, Grade.D, Grade.F]), // Exclude W and I
      },
      relations: ['course'],
    });

    const gpaData = this.calculateGPA(registrations);
    return gpaData.semesterGPA;
  }

  async updateGPA(studentId: number): Promise<void> {
    console.log(`[updateGPA] Updating GPA for student ${studentId}`);

    const registrations = await this.registrationsRepository.find({
      where: {
        studentId,
        isCompleted: true,
        grade: In([Grade.A, Grade.B, Grade.C, Grade.D, Grade.F]), // Exclude W and I
      },
      relations: ['course'],
    });

    console.log(
      `[updateGPA] Found ${registrations.length} completed registrations with grades`,
    );

    const gpaData = this.calculateGPA(registrations);
    console.log(
      `[updateGPA] Calculated GPA: ${gpaData.cumulativeGPA} (${gpaData.totalGradePoints} points / ${gpaData.totalCreditHours} hours)`,
    );

    await this.studentsRepository.update(studentId, {
      currentGPA: gpaData.cumulativeGPA,
    });

    console.log(`[updateGPA] GPA updated successfully`);
  }

  private calculateGPA(registrations: Registration[]): {
    cumulativeGPA: number;
    semesterGPA: number;
    totalCreditHours: number;
    totalGradePoints: number;
  } {
    let totalGradePoints = 0;
    let totalCreditHours = 0;

    const gradePointMap = {
      [Grade.A]: 4.0,
      [Grade.B]: 3.0,
      [Grade.C]: 2.0,
      [Grade.D]: 1.0,
      [Grade.F]: 0.0,
    };

    registrations.forEach((reg) => {
      if (reg.grade && reg.grade in gradePointMap) {
        const gradePoints = gradePointMap[reg.grade];
        const creditHours = reg.course.creditHours;

        totalGradePoints += gradePoints * creditHours;
        totalCreditHours += creditHours;
      }
    });

    const cumulativeGPA =
      totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;

    return {
      cumulativeGPA: Math.round(cumulativeGPA * 100) / 100,
      semesterGPA: cumulativeGPA, // For simplicity, using same calculation
      totalCreditHours,
      totalGradePoints,
    };
  }

  async getStudentStatistics(id: number) {
    const student = await this.findOne(id);

    const totalRegistrations = await this.registrationsRepository.count({
      where: { studentId: id },
    });

    const activeRegistrations = await this.registrationsRepository.count({
      where: { studentId: id, isDropped: false, isCompleted: false },
    });

    const completedRegistrations = await this.registrationsRepository.count({
      where: { studentId: id, isCompleted: true },
    });

    const totalCreditHours = await this.registrationsRepository
      .createQueryBuilder('registration')
      .leftJoin('registration.course', 'course')
      .select('SUM(course.creditHours)', 'total')
      .where('registration.studentId = :studentId', { studentId: id })
      .andWhere('registration.isCompleted = true')
      .getRawOne();

    return {
      student,
      statistics: {
        totalRegistrations,
        activeRegistrations,
        completedRegistrations,
        totalCreditHours: parseInt(totalCreditHours?.total) || 0,
        currentGPA: student.currentGPA,
      },
    };
  }
}
