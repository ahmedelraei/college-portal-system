import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Student } from './student.entity';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  PROFESSOR = 'professor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  // Password should not be exposed in GraphQL
  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  phoneNumber: string; // International format for WhatsApp, e.g. "201234567890"

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Student, (student) => student.user, { nullable: true })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Computed property for student ID (for frontend compatibility)
  get studentId(): number | null {
    return this.student?.studentId || null;
  }

  // Computed property for current GPA (for frontend compatibility)
  get currentGPA(): number | null {
    return this.student?.currentGPA ?? null;
  }
}
