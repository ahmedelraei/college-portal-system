import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Student } from '../../entities/student.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private jwtService: JwtService,
  ) {}

  async register(createStudentDto: CreateStudentDto) {
    const { studentId, email, password, firstName, lastName } =
      createStudentDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if student ID already exists
    const existingStudent = await this.studentsRepository.findOne({
      where: { studentId },
    });

    if (existingStudent) {
      throw new ConflictException('Student with this ID already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.STUDENT,
    });

    const savedUser = await this.usersRepository.save(user);

    // Create student record
    const student = this.studentsRepository.create({
      studentId,
      userId: savedUser.id,
      user: savedUser,
    });

    await this.studentsRepository.save(student);

    // Return user without password
    const { password: _, ...result } = savedUser;
    return { ...result, studentId };
  }

  async validateUser(studentId: number, password: string): Promise<any> {
    const student = await this.studentsRepository.findOne({
      where: { studentId },
      relations: ['user'],
    });

    if (
      student &&
      student.user &&
      student.user.isActive &&
      (await bcrypt.compare(password, student.user.password))
    ) {
      const { password: _, ...userResult } = student.user;
      return { ...userResult, studentId: student.studentId };
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const { studentId, password } = loginDto;
    const user = await this.validateUser(studentId, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildLoginResponse(user);
  }

  async loginFromUser(user: any) {
    return this.buildLoginResponse(user);
  }

  async findById(id: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
      relations: ['student'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...result } = user;
    return {
      ...result,
      studentId: user.student?.studentId,
      currentGPA: user.student?.currentGPA,
    };
  }

  async createAdmin(createStudentDto: CreateStudentDto) {
    const { email, password, firstName, lastName } = createStudentDto;

    // Check if admin already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin
    const admin = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.ADMIN,
    });

    const savedAdmin = await this.usersRepository.save(admin);

    // Return admin without password
    const { password: _, ...result } = savedAdmin;
    return result;
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.usersRepository.findOne({
      where: { email, role: UserRole.ADMIN, isActive: true },
    });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { password: _, ...result } = admin;
      return result;
    }

    return null;
  }

  async adminLogin(email: string, password: string) {
    const admin = await this.validateAdmin(email, password);

    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return this.buildLoginResponse(admin);
  }

  async getAllStudents(): Promise<any[]> {
    const students = await this.studentsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return students.map((student) => {
      const { password: _, ...userResult } = student.user;
      return { ...userResult, studentId: student.studentId };
    });
  }

  private buildLoginResponse(user: any) {
    const token = this.jwtService.sign({
      sub: user.id,
      studentId: user.studentId ?? null,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      user,
      message: 'Login successful',
    };
  }
}
