import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'lecture-content');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.ms-powerpoint', // ppt
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

@Injectable()
export class FileUploadService {
  constructor() {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadFile(
    file: any,
    courseId: number,
    weekId: number,
  ): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    // Validate file size
    if (file.file.bytesRead > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of 50MB`,
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: PDF, DOCX, PPTX, and common image formats.`,
      );
    }

    // Generate unique filename
    const ext = path.extname(file.filename);
    const randomName = randomBytes(16).toString('hex');
    const fileName = `${courseId}-${weekId}-${randomName}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save file
    const buffer = await file.toBuffer();
    await fs.writeFile(filePath, buffer);

    // Return relative URL path
    const fileUrl = `/uploads/lecture-content/${fileName}`;

    return {
      fileUrl,
      fileName: file.filename,
      fileSize: buffer.length,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.startsWith('/uploads/lecture-content/')) {
      return;
    }

    const fileName = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_DIR, fileName);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist or already deleted, ignore error
      console.warn(`Failed to delete file ${filePath}:`, error.message);
    }
  }
}
