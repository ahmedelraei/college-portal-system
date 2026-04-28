import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface WhatsappMessagePayload {
  to: string;
  body: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly instanceId: string;
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.instanceId =
      this.configService.get<string>('ULTRAMSG_INSTANCE_ID') || 'instance172300';
    this.token =
      this.configService.get<string>('ULTRAMSG_TOKEN') || '';
    this.baseUrl = `https://api.ultramsg.com/${this.instanceId}`;
  }

  /**
   * Send a WhatsApp message to a phone number via UltraMsg API.
   * Phone number should include country code (e.g. "201234567890").
   */
  async sendMessage(to: string, body: string): Promise<boolean> {
    if (!this.token) {
      this.logger.warn(
        'ULTRAMSG_TOKEN is not configured — skipping WhatsApp notification',
      );
      return false;
    }

    const url = `${this.baseUrl}/messages/chat`;
    const payload: WhatsappMessagePayload = { to, body };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token,
          to: payload.to,
          body: payload.body,
        }),
      });

      const data = await response.json();

      if (response.ok && data.sent === 'true') {
        this.logger.log(`WhatsApp message sent successfully to ${to}`);
        return true;
      }

      this.logger.warn(
        `WhatsApp message may not have been delivered to ${to}: ${JSON.stringify(data)}`,
      );
      return true; // API responded, we won't block on delivery status
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp message to ${to}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Send a grade notification to a student via WhatsApp.
   * This is a fire-and-forget operation — failures are logged but never thrown.
   */
  async sendGradeNotification(params: {
    phoneNumber: string;
    studentName: string;
    courseName: string;
    courseCode: string;
    grade: string;
    gradePoints: number | null;
  }): Promise<void> {
    const { phoneNumber, studentName, courseName, courseCode, grade, gradePoints } = params;

    const gradeEmoji = this.getGradeEmoji(grade);
    const gpText = gradePoints !== null ? `${gradePoints.toFixed(1)}` : 'N/A';

    const message = [
      `📚 *Grade Notification*`,
      ``,
      `Hello ${studentName},`,
      ``,
      `Your grade for *${courseName}* (${courseCode}) has been posted:`,
      ``,
      `${gradeEmoji} *Grade:* ${grade}`,
      `📊 *Grade Points:* ${gpText}`,
      ``,
      `You can view your full academic record on the student portal.`,
      ``,
      `— College Portal System`,
    ].join('\n');

    // Fire-and-forget: don't await or throw
    this.sendMessage(phoneNumber, message).catch((err) => {
      this.logger.error(
        `Grade notification failed for ${phoneNumber}: ${err.message}`,
      );
    });
  }

  private getGradeEmoji(grade: string): string {
    const emojiMap: Record<string, string> = {
      A: '🌟',
      B: '👏',
      C: '👍',
      D: '⚠️',
      F: '❌',
      I: '⏳',
      W: '🔄',
    };
    return emojiMap[grade] || '📝';
  }
}
