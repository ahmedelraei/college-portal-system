import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './lib/services/seeder.service';

async function bootstrap() {
  console.log('Starting standalone seeder application...');

  const app = await NestFactory.createApplicationContext(AppModule);

  const seederService = app.get(SeederService);
  await seederService.seed1000Students();

  await app.close();
  console.log('Standalone seeder finished.');
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Failed to seed:', err);
  process.exit(1);
});
