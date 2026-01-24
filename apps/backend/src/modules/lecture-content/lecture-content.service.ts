import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Week } from '../../entities/week.entity';
import { LectureContent } from '../../entities/lecture-content.entity';
import { ContentProgress } from '../../entities/content-progress.entity';
import { Registration, PaymentStatus } from '../../entities/registration.entity';
import { CreateWeekDto } from './dto/create-week.dto';
import { UpdateWeekDto } from './dto/update-week.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ReorderContentDto } from './dto/reorder-content.dto';

@Injectable()
export class LectureContentService {
  constructor(
    @InjectRepository(Week)
    private weekRepository: Repository<Week>,
    @InjectRepository(LectureContent)
    private contentRepository: Repository<LectureContent>,
    @InjectRepository(ContentProgress)
    private progressRepository: Repository<ContentProgress>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
  ) {}

  // Week Management Methods
  async getWeeksByCourse(
    courseId: number,
    includeUnpublished: boolean = false,
  ): Promise<Week[]> {
    const query = this.weekRepository
      .createQueryBuilder('week')
      .where('week.courseId = :courseId', { courseId })
      .orderBy('week.weekNumber', 'ASC');

    if (!includeUnpublished) {
      query.andWhere('week.isPublished = :isPublished', { isPublished: true });
    }

    return query.getMany();
  }

  async createWeek(courseId: number, dto: CreateWeekDto): Promise<Week> {
    // Check for duplicate week number
    const existing = await this.weekRepository.findOne({
      where: { courseId, weekNumber: dto.weekNumber },
    });

    if (existing) {
      throw new ConflictException(
        `Week ${dto.weekNumber} already exists for this course`,
      );
    }

    const week = this.weekRepository.create({
      ...dto,
      courseId,
    });

    return this.weekRepository.save(week);
  }

  async getWeekById(weekId: number): Promise<Week> {
    const week = await this.weekRepository.findOne({
      where: { id: weekId },
      relations: ['contents'],
    });

    if (!week) {
      throw new NotFoundException('Week not found');
    }

    // Sort contents by display order
    if (week.contents) {
      week.contents.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return week;
  }

  async updateWeek(weekId: number, dto: UpdateWeekDto): Promise<Week> {
    const week = await this.weekRepository.findOne({ where: { id: weekId } });

    if (!week) {
      throw new NotFoundException('Week not found');
    }

    // Check for duplicate week number if changing
    if (dto.weekNumber && dto.weekNumber !== week.weekNumber) {
      const existing = await this.weekRepository.findOne({
        where: { courseId: week.courseId, weekNumber: dto.weekNumber },
      });

      if (existing) {
        throw new ConflictException(
          `Week ${dto.weekNumber} already exists for this course`,
        );
      }
    }

    Object.assign(week, dto);
    return this.weekRepository.save(week);
  }

  async deleteWeek(weekId: number): Promise<void> {
    const week = await this.weekRepository.findOne({ where: { id: weekId } });

    if (!week) {
      throw new NotFoundException('Week not found');
    }

    await this.weekRepository.remove(week);
  }

  // Content Management Methods
  async getContentByWeek(weekId: number): Promise<LectureContent[]> {
    return this.contentRepository.find({
      where: { weekId },
      order: { displayOrder: 'ASC' },
    });
  }

  async createContent(
    weekId: number,
    dto: CreateContentDto,
  ): Promise<LectureContent> {
    // Verify week exists
    const week = await this.weekRepository.findOne({ where: { id: weekId } });
    if (!week) {
      throw new NotFoundException('Week not found');
    }

    const content = this.contentRepository.create({
      ...dto,
      weekId,
    });

    return this.contentRepository.save(content);
  }

  async updateContent(
    contentId: number,
    dto: UpdateContentDto,
  ): Promise<LectureContent> {
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    Object.assign(content, dto);
    return this.contentRepository.save(content);
  }

  async deleteContent(contentId: number): Promise<void> {
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    await this.contentRepository.remove(content);
  }

  async reorderContent(weekId: number, dto: ReorderContentDto): Promise<LectureContent[]> {
    // Verify all items belong to this week
    const items = await this.contentRepository.find({
      where: { id: In(dto.items.map((i) => i.id)) },
    });

    const invalidItems = items.filter((item) => item.weekId !== weekId);
    if (invalidItems.length > 0) {
      throw new BadRequestException(
        'All content items must belong to the specified week',
      );
    }

    // Update display orders
    await Promise.all(
      dto.items.map((item) =>
        this.contentRepository.update(item.id, {
          displayOrder: item.displayOrder,
        }),
      ),
    );

    return this.getContentByWeek(weekId);
  }

  // Student Content Access Methods
  async getCourseContent(
    courseId: number,
    studentId: number,
  ): Promise<{
    weeks: Array<{
      week: Week;
      content: Array<LectureContent & { isCompleted: boolean; completedAt: Date | null }>;
      progress: { completed: number; total: number };
    }>;
  }> {
    // Get published weeks
    const weeks = await this.getWeeksByCourse(courseId, false);

    // Get all content for these weeks with progress
    const weeksWithContent = await Promise.all(
      weeks.map(async (week) => {
        const contents = await this.contentRepository.find({
          where: { weekId: week.id },
          order: { displayOrder: 'ASC' },
        });

        // Get progress for this student
        const contentIds = contents.map((c) => c.id);
        const progressRecords = await this.progressRepository.find({
          where: {
            studentId,
            contentId: In(contentIds),
          },
        });

        const progressMap = new Map(
          progressRecords.map((p) => [p.contentId, p]),
        );

        const contentWithProgress = contents.map((content) => {
          const progress = progressMap.get(content.id);
          return {
            ...content,
            isCompleted: !!progress,
            completedAt: progress?.completedAt || null,
          };
        });

        return {
          week,
          content: contentWithProgress,
          progress: {
            completed: contentWithProgress.filter((c) => c.isCompleted).length,
            total: contentWithProgress.length,
          },
        };
      }),
    );

    return { weeks: weeksWithContent };
  }

  async verifyPaidRegistration(
    studentId: number,
    courseId: number,
  ): Promise<boolean> {
    const registration = await this.registrationRepository.findOne({
      where: {
        studentId,
        courseId,
        paymentStatus: PaymentStatus.PAID,
      },
    });

    return !!registration;
  }

  // Progress Tracking Methods
  async markContentComplete(
    studentId: number,
    contentId: number,
  ): Promise<ContentProgress> {
    // Check if already completed
    const existing = await this.progressRepository.findOne({
      where: { studentId, contentId },
    });

    if (existing) {
      throw new ConflictException('Content already marked as complete');
    }

    // Verify content exists
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const progress = this.progressRepository.create({
      studentId,
      contentId,
      completedAt: new Date(),
    });

    return this.progressRepository.save(progress);
  }

  async removeContentProgress(
    studentId: number,
    contentId: number,
  ): Promise<void> {
    const progress = await this.progressRepository.findOne({
      where: { studentId, contentId },
    });

    if (!progress) {
      throw new NotFoundException('Progress record not found');
    }

    await this.progressRepository.remove(progress);
  }

  async getProgressSummary(
    studentId: number,
    courseId: number,
  ): Promise<{
    courseId: number;
    totalItems: number;
    completedItems: number;
    percentComplete: number;
    weekProgress: Array<{
      weekId: number;
      weekNumber: number;
      title: string;
      completed: number;
      total: number;
    }>;
  }> {
    const weeks = await this.getWeeksByCourse(courseId, false);

    const weekProgress = await Promise.all(
      weeks.map(async (week) => {
        const contents = await this.contentRepository.find({
          where: { weekId: week.id },
        });

        const contentIds = contents.map((c) => c.id);
        const completed = await this.progressRepository.count({
          where: {
            studentId,
            contentId: In(contentIds),
          },
        });

        return {
          weekId: week.id,
          weekNumber: week.weekNumber,
          title: week.title,
          completed,
          total: contents.length,
        };
      }),
    );

    const totalItems = weekProgress.reduce((sum, w) => sum + w.total, 0);
    const completedItems = weekProgress.reduce((sum, w) => sum + w.completed, 0);
    const percentComplete =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      courseId,
      totalItems,
      completedItems,
      percentComplete,
      weekProgress,
    };
  }
}
