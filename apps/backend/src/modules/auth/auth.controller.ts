import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ProfessorLoginDto } from './dto/professor-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createStudentDto: CreateStudentDto) {
    return this.authService.register(createStudentDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    if (req.user) {
      return this.authService.loginFromUser(req.user);
    }

    return this.authService.login(loginDto);
  }

  @Post('admin/register')
  async registerAdmin(@Body() createStudentDto: CreateStudentDto) {
    return this.authService.createAdmin(createStudentDto);
  }

  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(
      adminLoginDto.email,
      adminLoginDto.password,
    );
  }

  @Post('professor/login')
  async professorLogin(@Body() professorLoginDto: ProfessorLoginDto) {
    return this.authService.professorLogin(
      professorLoginDto.email,
      professorLoginDto.password,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/students')
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.authService.register(createStudentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/professors')
  async createProfessor(@Body() createProfessorDto: CreateProfessorDto) {
    return this.authService.createProfessor(createProfessorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/professors')
  async getAllProfessors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.authService.getAllProfessors(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/professors/:id')
  async updateProfessor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any, // Create a DTO later if needed
  ) {
    return this.authService.updateProfessor(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // Since we're using stateless JWT, logout is handled on the client side
    return { message: 'Logged out successfully' };
  }
}
