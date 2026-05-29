import './tracing';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableShutdownHooks();

  // Worker does not need HTTP routing but NestJS lifecycle requires a listen call.
  // We use a dedicated port (default 3001) to keep it separate from the API.
  const port = process.env['WORKER_PORT'] ?? 3001;
  await app.listen(port);

  console.log(`Worker running on port ${port}`);
}

void bootstrap();
