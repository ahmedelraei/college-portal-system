import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { Week } from '../../entities/week.entity';
import { LectureContent } from '../../entities/lecture-content.entity';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ChatbotService {
  private llm: ChatOpenAI;

  private generateToken(apikey: string, expSeconds: number): string {
    try {
      const [id, secret] = apikey.split('.');
      if (!id || !secret) {
        throw new Error('Invalid API key format. Expected id.secret');
      }

      const payload = {
        api_key: id,
        exp: Math.floor(Date.now() / 1000) + expSeconds,
        timestamp: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        header: { alg: 'HS256', sign_type: 'SIGN' } as any,
      });
    } catch (error) {
       console.error('Error generating token:', error);
       throw error;
    }
  }

  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Week)
    private weekRepo: Repository<Week>,
    @InjectRepository(LectureContent)
    private contentRepo: Repository<LectureContent>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('Z_AI_API_KEY') || 'YOUR_API_KEY.SECRET';
    const token = this.generateToken(apiKey, 3600);
    
    // Initialize standard ChatOpenAI with the Z.AI base URL and dynamically generated token
    this.llm = new ChatOpenAI({
      modelName: 'glm-4.5',
      apiKey: token, 
      configuration: {
        baseURL: 'https://api.z.ai/api/paas/v4',
        defaultHeaders: {
          'Authorization': `Bearer ${token}`
        }
      },
      temperature: 0.7,
      maxTokens: 1024,
    });
  }

  async askQuestion(courseId: number, userMessage: string): Promise<{ reply: string }> {
    // 1. Fetch course details
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // 2. Fetch weeks and content to build context
    const weeks = await this.weekRepo.find({
      where: { courseId: course.id, isPublished: true },
    });

    const weekIds = weeks.map((w) => w.id);
    let lectureContents: LectureContent[] = [];
    
    if (weekIds.length > 0) {
       lectureContents = await this.contentRepo
          .createQueryBuilder('content')
          .where('content.week_id IN (:...weekIds)', { weekIds })
          .orderBy('content.week_id', 'ASC')
          .addOrderBy('content.display_order', 'ASC')
          .getMany();
    }

    // 3. Construct the context payload
    let contextStr = `Course Name: ${course.courseName} (${course.courseCode})\n`;
    contextStr += `Description: ${course.description}\n\n`;
    contextStr += `Course Materials:\n`;

    weeks.forEach((week) => {
      contextStr += `\nWeek ${week.weekNumber}: ${week.title}\n`;
      const contentsForWeek = lectureContents.filter((c) => c.weekId === week.id);
      contentsForWeek.forEach((content) => {
        contextStr += `- Content Title: ${content.title} (${content.contentType})\n`;
        if (content.description) {
           contextStr += `  Description: ${content.description}\n`;
        }
        if (content.textContent) {
           contextStr += `  Text Content: ${content.textContent.substring(0, 500)}...\n`; // Trim to save tokens
        }
      });
    });

    // 4. Build prompt and query Langchain
    const systemPromptStr = `You are a helpful teaching assistant for the course "${course.courseName}". 
Use the following course context to answer the student's question accurately. 
If the answer is not in the context, say you don't know based on the provided material.

Context:
${contextStr}
`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage(systemPromptStr),
        new HumanMessage(userMessage),
      ]);
      
      return { reply: response.content as string };
    } catch (error) {
       console.error('Error querying GLM API via Langchain:', error);
       throw new Error('Failed to communicate with AI Assistant.');
    }
  }
}
