import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Course } from './course.entity';
import { LectureContent } from './lecture-content.entity';

@Entity('weeks')
@Unique(['courseId', 'weekNumber'])
@Index(['courseId'])
export class Week {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_id', type: 'int' })
  courseId: number;

  @ManyToOne(() => Course, (course) => course.weeks, { onDelete: 'CASCADE' })
  course: Course;

  @Column({ name: 'week_number', type: 'int' })
  weekNumber: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @OneToMany(() => LectureContent, (content) => content.week, {
    cascade: true,
  })
  contents: LectureContent[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
