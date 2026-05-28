// MUST be first import — initializes OpenTelemetry before any NestJS module
import './tracing';

import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import type { Env } from '@gestao-fretamento-pro/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    bufferLogs: true,
  });

  const config = app.get<Env>('CONFIG');

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
        },
      },
    }),
  );

  // CORS
  const corsOrigins = (config.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Tenant-Id',
    ],
    credentials: true,
  });

  // API versioning — /v1/...
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('v1');

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Graceful shutdown — waits for in-flight requests before exiting
  app.enableShutdownHooks();

  // OpenAPI documentation (disabled in production)
  if (config.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Gestão Fretamento Pro API')
      .setDescription('API REST para gestão de fretamento empresarial')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticação e autorização')
      .addTag('tenants', 'Gestão de empresas e filiais')
      .addTag('users', 'Gestão de usuários')
      .addTag('roles', 'Gestão de cargos e permissões')
      .addTag('vehicles', 'Gestão de frota')
      .addTag('drivers', 'Gestão de motoristas')
      .addTag('trips', 'Gestão de viagens')
      .addTag('clients', 'Gestão de clientes')
      .addTag('occurrences', 'Gestão de ocorrências')
      .addTag('fuel', 'Controle de abastecimento')
      .addTag('maintenance', 'Gestão de manutenção')
      .addTag('documents', 'Gestão de documentos')
      .addTag('notifications', 'Notificações')
      .addTag('analytics', 'Dashboards e analytics')
      .addTag('audit', 'Logs de auditoria')
      .addTag('health', 'Health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.PORT ?? 3000;
  await app.listen(port);

  console.log(`API running on port ${port}`);
  if (config.NODE_ENV !== 'production') {
    console.log(`Swagger docs: http://localhost:${port}/docs`);
  }
}

void bootstrap();
