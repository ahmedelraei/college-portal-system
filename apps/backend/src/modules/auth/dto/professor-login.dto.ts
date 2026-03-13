import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ProfessorLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
