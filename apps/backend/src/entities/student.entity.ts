import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Registration } from './registration.entity';
import { Payment } from './payment.entity';
import { User } from './user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  studentId: number; // College ID - now integer format like 12200207

  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0.0 })
  currentGPA: number;

  @OneToMany(() => Registration, (registration) => registration.student)
  registrations: Registration[];

  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties that delegate to user
  get firstName(): string {
    return this.user?.firstName || '';
  }

  get lastName(): string {
    return this.user?.lastName || '';
  }

  get email(): string {
    return this.user?.email || '';
  }

  get fullName(): string {
    return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
  }

  get isActive(): boolean {
    return this.user?.isActive || false;
  }

  get role(): string {
    return this.user?.role || 'student';
  }
}
