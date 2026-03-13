import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatbotService } from './chatbot.service';
import { ChatbotRequestDto } from './dto/chatbot-request.dto';

@Controller('students/chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  async askQuestion(
    @Request() req,
    @Body() body: ChatbotRequestDto,
  ) {
    // Optionally use req.user.id to log who is asking
    return this.chatbotService.askQuestion(body.courseId, body.message);
  }
}
