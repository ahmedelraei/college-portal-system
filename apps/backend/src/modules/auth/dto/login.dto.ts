import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}
