import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum Grade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F',
  INCOMPLETE = 'I',
  WITHDRAW = 'W',
}

@Entity('registrations')
@Unique(['student', 'course', 'semester', 'year'])
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.registrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: number;

  @ManyToOne(() => Course, (course) => course.registrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  @Column()
  semester: string; // "summer" or "winter"

  @Column('int')
  year: number; // e.g., 2024

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PAID, // Auto-approve since no payment system is implemented
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: Grade,
    nullable: true,
  })
  grade: Grade;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  gradePoints: number | null; // A=4.0, B=3.0, C=2.0, D=1.0, F=0.0

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  isDropped: boolean;

  @Column({ nullable: true })
  droppedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Method to calculate grade points based on grade
  calculateGradePoints(): number | null {
    const gradePointMap = {
      [Grade.A]: 4.0,
      [Grade.B]: 3.0,
      [Grade.C]: 2.0,
      [Grade.D]: 1.0,
      [Grade.F]: 0.0,
      [Grade.INCOMPLETE]: 0.0,
      [Grade.WITHDRAW]: null, // Withdrawals don't count toward GPA
    };

    return gradePointMap[this.grade] ?? null;
  }
}
