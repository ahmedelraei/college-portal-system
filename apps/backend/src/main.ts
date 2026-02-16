import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { SeederService } from './lib/services/seeder.service';
import { HttpExceptionFilter } from './lib/filters/http-exception.filter';

async function bootstrap() {
  console.log('Starting application with DB config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    db: process.env.DB_NAME,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');

  // Register cookie support
  await app.register(require('@fastify/cookie'));

  // Register session plugin for Fastify
  await app.register(require('@fastify/session'), {
    secret:
      process.env.SESSION_SECRET ||
      'your-super-secret-session-key-change-this-in-production',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  });

  // Register multipart for file uploads (50MB limit)
  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  // Register static file serving for uploaded content
  await app.register(require('@fastify/static'), {
    root: require('path').join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  });

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Run database seeding
  const seederService = app.get(SeederService);
  await seederService.seedAll();

  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
  console.log(
    `🚀 College Portal API is running on: http://localhost:${process.env.PORT ?? 8080}`,
  );
}
bootstrap();
