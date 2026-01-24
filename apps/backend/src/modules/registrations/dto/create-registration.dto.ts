import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateRegistrationDto {
  @IsNumber()
  studentId: number;

  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @IsNotEmpty()
  @IsString()
  semester: string; // "summer" or "winter"

  @IsNumber()
  @Min(2020)
  year: number;
}
