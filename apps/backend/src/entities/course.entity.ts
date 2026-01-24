import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Week } from './week.entity';

export enum Semester {
  SUMMER = 'summer',
  WINTER = 'winter',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  courseCode: string; // e.g., "CS101", "MATH201"

  @Column()
  courseName: string;

  @Column('text')
  description: string;

  @Column('int')
  creditHours: number; // 2, 3, or 4 credits

  @Column('decimal', { precision: 8, scale: 2, default: 500.0 })
  pricePerCredit: number; // $500 per credit hour

  @Column({
    type: 'enum',
    enum: Semester,
  })
  semester: Semester;

  @Column({ default: true })
  isActive: boolean;

  // Self-referencing many-to-many for prerequisites
  @ManyToMany(() => Course, (course) => course.dependentCourses)
  @JoinTable({
    name: 'course_prerequisites',
    joinColumn: { name: 'courseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'prerequisiteId', referencedColumnName: 'id' },
  })
  prerequisites: Course[];

  @ManyToMany(() => Course, (course) => course.prerequisites)
  dependentCourses: Course[];

  @OneToMany('Registration', 'course')
  registrations: any[];

  @OneToMany(() => Week, (week) => week.course)
  weeks: Week[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property for total cost
  get totalCost(): number {
    return this.creditHours * this.pricePerCredit;
  }
}
