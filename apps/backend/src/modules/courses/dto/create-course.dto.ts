import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Semester } from '../../../entities/course.entity';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  courseCode: string;

  @IsNotEmpty()
  @IsString()
  courseName: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  @Max(4)
  creditHours: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricePerCredit?: number;

  @IsEnum(Semester)
  semester: Semester;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  prerequisiteIds?: string[];
}
