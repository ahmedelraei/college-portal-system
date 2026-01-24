import { IsInt, IsString, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class UpdateWeekDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  weekNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
