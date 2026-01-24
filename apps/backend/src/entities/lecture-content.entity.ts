import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Week } from './week.entity';
import { ContentProgress } from './content-progress.entity';

export enum ContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  READING = 'reading',
  ASSIGNMENT = 'assignment',
}

@Entity('lecture_content')
@Index(['weekId'])
@Index(['weekId', 'displayOrder'])
export class LectureContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'week_id', type: 'int' })
  weekId: number;

  @ManyToOne(() => Week, (week) => week.contents, { onDelete: 'CASCADE' })
  week: Week;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 20,
  })
  contentType: ContentType;

  @Column({ name: 'external_url', type: 'varchar', length: 2048, nullable: true })
  externalUrl: string | null;

  @Column({ name: 'file_url', type: 'varchar', length: 512, nullable: true })
  fileUrl: string | null;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @OneToMany(() => ContentProgress, (progress) => progress.content, {
    cascade: true,
  })
  progress: ContentProgress[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
