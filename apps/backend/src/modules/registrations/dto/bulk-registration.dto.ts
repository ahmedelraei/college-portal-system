import { IsNotEmpty, IsString, IsNumber, IsArray, Min } from 'class-validator';

export class BulkRegistrationDto {
  @IsNumber()
  studentId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  courseIds: number[];

  @IsNotEmpty()
  @IsString()
  semester: string; // "summer" or "winter"

  @IsNumber()
  @Min(2020)
  year: number;
}
