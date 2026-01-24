import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Student } from './student.entity';
import { LectureContent } from './lecture-content.entity';

@Entity('content_progress')
@Unique(['studentId', 'contentId'])
@Index(['studentId'])
@Index(['contentId'])
export class ContentProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column({ name: 'content_id', type: 'int' })
  contentId: number;

  @ManyToOne(() => LectureContent, (content) => content.progress, {
    onDelete: 'CASCADE',
  })
  content: LectureContent;

  @Column({ name: 'completed_at', type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
