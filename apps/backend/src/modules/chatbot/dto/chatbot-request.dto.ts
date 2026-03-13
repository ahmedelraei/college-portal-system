import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class ChatbotRequestDto {
  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
