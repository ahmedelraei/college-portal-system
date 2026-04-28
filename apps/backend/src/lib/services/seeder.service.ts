import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Course, Semester } from '../../entities/course.entity';
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
        phoneNumber: '+201050789177',
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

  async seed1000Students(): Promise<void> {
    this.logger.log('🌱 Starting to seed 1000 students...');
    try {
      const startId = 20000000;
      
      // Check if already seeded
      const existingStudent = await this.studentsRepository.findOne({
        where: { studentId: startId },
      });

      if (existingStudent) {
        this.logger.log('1000 students already seem to be seeded (found startId). Skipping.');
        return;
      }

      const defaultPassword = 'Student123!';
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      
      const egyptianFirstNames = [
        'Ahmed', 'Mohamed', 'Mahmoud', 'Omar', 'Ali', 'Hassan', 'Hussein', 'Youssef', 'Amr', 'Tarek',
        'Fatima', 'Aisha', 'Salma', 'Nour', 'Habiba', 'Mariam', 'Yasmin', 'Sara', 'Laila', 'Hala',
        'Mostafa', 'Ibrahim', 'Kareem', 'Adel', 'Hatem', 'Osama', 'Wael', 'Khaled', 'Sherif', 'Mina',
        'Nadia', 'Dina', 'Menna', 'Yara', 'Hoda', 'Eman', 'Amira', 'Reem', 'Aya', 'Maha'
      ];

      const egyptianLastNames = [
        'El-Sayed', 'Hassan', 'Ali', 'Ibrahim', 'Kamal', 'Fawzy', 'Saeed', 'Adel', 'Mansour', 'Tawfik',
        'Gaber', 'Ezzat', 'Rashad', 'Hamed', 'Soliman', 'Farouk', 'Osman', 'Abdel-Rahman', 'Nassar', 'Ghanem',
        'Zaki', 'Mahmoud', 'Fahmy', 'Fathy', 'Radwan', 'Shawky', 'Saleh', 'Salem', 'Wahba', 'Saad'
      ];
      
      const userBatch: User[] = [];
      
      for (let i = 0; i < 1000; i++) {
        const studentId = startId + i;
        const email = `student${studentId}@modernacademy.edu`;
        const randomFirstName = egyptianFirstNames[Math.floor(Math.random() * egyptianFirstNames.length)];
        const randomLastName = egyptianLastNames[Math.floor(Math.random() * egyptianLastNames.length)];
        
        userBatch.push(
          this.usersRepository.create({
            email,
            password: hashedPassword,
            firstName: randomFirstName,
            lastName: randomLastName,
            role: UserRole.STUDENT,
            isActive: true,
          })
        );
      }

      // Save users in chunks
      const savedUsers = await this.usersRepository.save(userBatch, { chunk: 100 });
      this.logger.log('✅ Successfully saved 1000 user records.');

      const studentBatch: Student[] = savedUsers.map((user, idx) => {
        return this.studentsRepository.create({
          studentId: startId + idx,
          userId: user.id,
        });
      });

      // Save students in chunks
      await this.studentsRepository.save(studentBatch, { chunk: 100 });
      this.logger.log('✅ Successfully saved 1000 student records.');
      this.logger.log('✅ 1000 students seeding completed.');
    } catch (error) {
      this.logger.error('❌ Failed to seed 1000 students:', error.message);
      throw error;
    }
  }

  async seedProfessorsAndCourses(): Promise<void> {
    this.logger.log('🌱 Starting to seed professors and 50 courses...');
    try {
      const existingCoursesCount = await this.coursesRepository.count();
      if (existingCoursesCount >= 50) {
        this.logger.log('Already found 50+ courses. Skipping seeding.');
        return;
      }

      // Seed 5 Professors
      const professors: User[] = [];
      const hashedPassword = await bcrypt.hash('Professor123!', 12);
      for (let i = 1; i <= 5; i++) {
        const email = `professor${i}@modernacademy.edu`;
        const existingProf = await this.usersRepository.findOne({ where: { email } });
        if (existingProf) {
          professors.push(existingProf);
        } else {
          const prof = this.usersRepository.create({
            email,
            password: hashedPassword,
            firstName: `Prof${i}`,
            lastName: `Instructor`,
            role: UserRole.PROFESSOR,
            isActive: true,
          });
          professors.push(prof);
        }
      }
      const savedProfessors = await this.usersRepository.save(professors);
      this.logger.log(`✅ Saved ${savedProfessors.length} professors.`);

      // Seed exactly 50 Computer Science Courses
      const csTopics = [
        'Programming', 'Data Structures', 'Algorithms', 'Databases', 'Operating Systems',
        'Computer Networks', 'Artificial Intelligence', 'Machine Learning', 'Software Engineering', 'Web Development'
      ];
      const courseBatch: Course[] = [];

      for (let i = 0; i < 50; i++) {
        const num = 101 + i;
        const topic = csTopics[i % csTopics.length];
        const profId = savedProfessors[Math.floor(Math.random() * savedProfessors.length)].id;
        const semester = Math.random() > 0.5 ? Semester.SUMMER : Semester.WINTER;
        courseBatch.push(
          this.coursesRepository.create({
            courseCode: `CS${num}`,
            courseName: `${topic} Concepts ${num}`,
            description: `This is a comprehensive course covering advanced topics in ${topic}.`,
            creditHours: Math.floor(Math.random() * 3) + 2, // 2 to 4 credits
            pricePerCredit: 500.0,
            semester: semester,
            isActive: true,
            professorId: profId,
          })
        );
      }

      // Save courses in chunks
      await this.coursesRepository.save(courseBatch, { chunk: 50 });
      this.logger.log(`✅ Successfully saved ${courseBatch.length} courses.`);
    } catch (error) {
      this.logger.error('❌ Failed to seed professors and courses:', error.message);
      throw error;
    }
  }
}
