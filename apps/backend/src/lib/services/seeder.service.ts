import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Course } from '../../entities/course.entity';
import { Week } from '../../entities/week.entity';
import { LectureContent, ContentType } from '../../entities/lecture-content.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Week)
    private weeksRepository: Repository<Week>,
    @InjectRepository(LectureContent)
    private contentRepository: Repository<LectureContent>,
    private configService: ConfigService,
  ) {}

  async seedDefaultAdmin(): Promise<void> {
    try {
      // Check if any admin already exists
      const existingAdmin = await this.usersRepository.findOne({
        where: { role: UserRole.ADMIN },
      });

      if (existingAdmin) {
        this.logger.log('Default admin already exists, skipping seeding');
        return;
      }

      // Get default admin credentials from environment variables
      const defaultAdminEmail = this.configService.get<string>(
        'DEFAULT_ADMIN_EMAIL',
        'admin@modernacademy.edu',
      );
      const defaultAdminPassword = this.configService.get<string>(
        'DEFAULT_ADMIN_PASSWORD',
        'Admin123!',
      );
      const defaultAdminFirstName = this.configService.get<string>(
        'DEFAULT_ADMIN_FIRST_NAME',
        'System',
      );
      const defaultAdminLastName = this.configService.get<string>(
        'DEFAULT_ADMIN_LAST_NAME',
        'Administrator',
      );

      // Hash the password
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 12);

      // Create the default admin
      const defaultAdmin = this.usersRepository.create({
        email: defaultAdminEmail,
        password: hashedPassword,
        firstName: defaultAdminFirstName,
        lastName: defaultAdminLastName,
        role: UserRole.ADMIN,
        isActive: true,
      });

      await this.usersRepository.save(defaultAdmin);

      this.logger.log(
        `✅ Default admin created successfully with email: ${defaultAdminEmail}`,
      );
      this.logger.warn(
        '⚠️  Please change the default admin password after first login!',
      );
    } catch (error) {
      this.logger.error('❌ Failed to create default admin:', error.message);
      throw error;
    }
  }

  async seedDefaultStudent(): Promise<void> {
    try {
      // Check if default student already exists
      const existingStudent = await this.studentsRepository.findOne({
        where: { studentId: 12200207 },
      });

      if (existingStudent) {
        this.logger.log('Default student already exists, skipping seeding');
        return;
      }

      // Create student user
      const hashedPassword = await bcrypt.hash('Student123!', 12);

      const studentUser = this.usersRepository.create({
        email: 'student@modernacademy.edu',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Student',
        role: UserRole.STUDENT,
        isActive: true,
      });

      const savedUser = await this.usersRepository.save(studentUser);

      // Create student record
      const student = this.studentsRepository.create({
        studentId: 12200207,
        userId: savedUser.id,
        user: savedUser,
      });

      await this.studentsRepository.save(student);

      this.logger.log(
        `✅ Default student created successfully with ID: 12200207`,
      );
      this.logger.log(`   Email: student@modernacademy.edu`);
      this.logger.log(`   Password: Student123!`);
    } catch (error) {
      this.logger.error('❌ Failed to create default student:', error.message);
      throw error;
    }
  }

  async seedSampleLectureContent(): Promise<void> {
    try {
      // Check if content already exists
      const existingWeek = await this.weeksRepository.findOne({
        where: { weekNumber: 1 },
      });

      if (existingWeek) {
        this.logger.log('Sample lecture content already exists, skipping seeding');
        return;
      }

      // Get a sample course (assuming courses exist)
      const sampleCourse = await this.coursesRepository.findOne({
        where: {},
      });

      if (!sampleCourse) {
        this.logger.warn('No courses found, skipping lecture content seeding');
        return;
      }

      // Create sample weeks
      const week1 = this.weeksRepository.create({
        courseId: sampleCourse.id,
        weekNumber: 1,
        title: 'Introduction to Course Materials',
        description: 'Welcome to the course! This week covers foundational concepts.',
        isPublished: true,
      });
      const savedWeek1 = await this.weeksRepository.save(week1);

      const week2 = this.weeksRepository.create({
        courseId: sampleCourse.id,
        weekNumber: 2,
        title: 'Core Concepts',
        description: 'Diving deeper into the subject matter.',
        isPublished: true,
      });
      const savedWeek2 = await this.weeksRepository.save(week2);

      // Create sample content for week 1
      await this.contentRepository.save([
        this.contentRepository.create({
          weekId: savedWeek1.id,
          title: 'Course Introduction Video',
          contentType: ContentType.VIDEO,
          externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          description: 'Welcome video introducing the course structure and objectives.',
          displayOrder: 0,
        }),
        this.contentRepository.create({
          weekId: savedWeek1.id,
          title: 'Course Syllabus',
          contentType: ContentType.DOCUMENT,
          description: 'Comprehensive course syllabus and schedule.',
          textContent: 'This is a placeholder for the syllabus document.',
          displayOrder: 1,
        }),
        this.contentRepository.create({
          weekId: savedWeek1.id,
          title: 'Reading: Chapter 1',
          contentType: ContentType.READING,
          textContent:
            'Chapter 1 introduces the fundamental concepts that will be explored throughout this course. Students should familiarize themselves with the terminology and basic principles outlined in this chapter.',
          description: 'Required reading for Week 1.',
          displayOrder: 2,
        }),
      ]);

      // Create sample content for week 2
      await this.contentRepository.save([
        this.contentRepository.create({
          weekId: savedWeek2.id,
          title: 'Lecture: Advanced Topics',
          contentType: ContentType.VIDEO,
          externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          description: 'In-depth lecture on advanced course topics.',
          displayOrder: 0,
        }),
        this.contentRepository.create({
          weekId: savedWeek2.id,
          title: 'Assignment 1: Practice Exercises',
          contentType: ContentType.ASSIGNMENT,
          textContent:
            'Complete the following exercises:\n\n1. Problem Set A (Questions 1-5)\n2. Problem Set B (Questions 6-10)\n\nDue date: End of Week 2\n\nSubmission instructions will be provided via email.',
          description: 'First assignment to practice concepts from weeks 1-2.',
          displayOrder: 1,
        }),
      ]);

      this.logger.log(
        `✅ Sample lecture content created for course: ${sampleCourse.courseName}`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Failed to create sample lecture content:',
        error.message,
      );
      throw error;
    }
  }

  async seedAll(): Promise<void> {
    this.logger.log('🌱 Starting database seeding...');

    try {
      await this.seedDefaultAdmin();
      await this.seedDefaultStudent();
      await this.seedSampleLectureContent();
      this.logger.log('✅ Database seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error.message);
      throw error;
    }
  }
}
