import { IsString, IsEnum, IsOptional, IsInt, MaxLength, IsUrl, Min } from 'class-validator';
import { ContentType } from '../../../entities/lecture-content.entity';

export class CreateContentDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  externalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  fileUrl?: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
