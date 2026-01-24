import { IsInt, IsString, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateWeekDto {
  @IsInt()
  @Min(1)
  weekNumber: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
