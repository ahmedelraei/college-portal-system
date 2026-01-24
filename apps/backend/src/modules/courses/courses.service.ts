import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { Registration } from '../../entities/registration.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Registration)
    private registrationsRepository: Repository<Registration>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { prerequisiteIds, ...courseData } = createCourseDto;

    // Check if course code already exists
    const existingCourse = await this.coursesRepository.findOne({
      where: { courseCode: courseData.courseCode },
    });

    if (existingCourse) {
      throw new ConflictException('Course with this code already exists');
    }

    // Get prerequisites if provided
    let prerequisites: Course[] = [];
    if (prerequisiteIds && prerequisiteIds.length > 0) {
      prerequisites = await this.coursesRepository.find({
        where: { id: In(prerequisiteIds) },
      });

      if (prerequisites.length !== prerequisiteIds.length) {
        throw new NotFoundException(
          'One or more prerequisite courses not found',
        );
      }
    }

    // Create course
    const course = this.coursesRepository.create({
      ...courseData,
      prerequisites,
    });

    return this.coursesRepository.save(course);
  }

  async findAll(filters?: CourseFilterDto): Promise<Course[]> {
    const queryBuilder = this.coursesRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.prerequisites', 'prerequisites')
      .where('course.isActive = :isActive', { isActive: true });

    if (filters?.semester) {
      queryBuilder.andWhere('course.semester = :semester', {
        semester: filters.semester,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(course.courseName ILIKE :search OR course.courseCode ILIKE :search OR course.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.creditHours) {
      queryBuilder.andWhere('course.creditHours = :creditHours', {
        creditHours: filters.creditHours,
      });
    }

    return queryBuilder.orderBy('course.courseCode', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id, isActive: true },
      relations: ['prerequisites', 'dependentCourses'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async findByCode(courseCode: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { courseCode, isActive: true },
      relations: ['prerequisites'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const { prerequisiteIds, ...courseData } = updateCourseDto;

    const course = await this.findOne(id);

    // Update prerequisites if provided
    if (prerequisiteIds !== undefined) {
      let prerequisites: Course[] = [];
      if (prerequisiteIds.length > 0) {
        prerequisites = await this.coursesRepository.find({
          where: { id: In(prerequisiteIds) },
        });

        if (prerequisites.length !== prerequisiteIds.length) {
          throw new NotFoundException(
            'One or more prerequisite courses not found',
          );
        }
      }
      course.prerequisites = prerequisites;
    }

    // Update other fields
    Object.assign(course, courseData);

    return this.coursesRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);

    // Check if course has any active registrations
    const activeRegistrations = await this.registrationsRepository.count({
      where: { courseId: id, isDropped: false },
    });

    if (activeRegistrations > 0) {
      throw new ConflictException(
        'Cannot delete course with active registrations',
      );
    }

    course.isActive = false;
    await this.coursesRepository.save(course);
  }

  async checkPrerequisites(
    studentId: number,
    courseId: number,
  ): Promise<{ canRegister: boolean; missingPrerequisites: Course[] }> {
    const course = await this.findOne(courseId);

    if (!course.prerequisites || course.prerequisites.length === 0) {
      return { canRegister: true, missingPrerequisites: [] };
    }

    // Get completed courses for the student
    const completedRegistrations = await this.registrationsRepository.find({
      where: {
        studentId,
        isCompleted: true,
        grade: In(['A', 'B', 'C', 'D']), // Passing grades
      },
      relations: ['course'],
    });

    const completedCourseIds = completedRegistrations.map(
      (reg) => reg.courseId,
    );
    const missingPrerequisites = course.prerequisites.filter(
      (prereq) => !completedCourseIds.includes(prereq.id),
    );

    return {
      canRegister: missingPrerequisites.length === 0,
      missingPrerequisites,
    };
  }

  async getCourseStatistics(id: number) {
    const course = await this.findOne(id);

    const totalRegistrations = await this.registrationsRepository.count({
      where: { courseId: id },
    });

    const activeRegistrations = await this.registrationsRepository.count({
      where: { courseId: id, isDropped: false },
    });

    const completedRegistrations = await this.registrationsRepository.count({
      where: { courseId: id, isCompleted: true },
    });

    return {
      course,
      statistics: {
        totalRegistrations,
        activeRegistrations,
        completedRegistrations,
      },
    };
  }
}
