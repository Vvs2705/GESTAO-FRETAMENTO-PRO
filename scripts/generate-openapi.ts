import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../apps/api-core/src/app.module';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yaml from 'js-yaml';

async function main() {
  console.log('Generating OpenAPI specification...');
  
  // Set required dummy env vars for bootstrap validation
  process.env['PORT'] = '3000';
  process.env['NODE_ENV'] = 'development';
  process.env['DATABASE_URL'] = 'postgresql://dummy:dummy@localhost:5432/dummy';
  process.env['REDIS_URL'] = 'redis://localhost:6379';
  process.env['JWT_SECRET'] = 'dummy_secret_dummy_secret_dummy_secret_dummy_secret';
  process.env['JWT_REFRESH_SECRET'] = 'dummy_refresh_secret_dummy_refresh_secret';
  process.env['CORS_ORIGINS'] = 'http://localhost:3000';
  process.env['RATE_LIMIT_WINDOW_MS'] = '60000';
  process.env['WORKER_PORT'] = '3001';

  // Create the NestJS app instance (logger: false to be silent)
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('v1');

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
  
  // Convert document to YAML format
  const yamlString = yaml.dump(document, { noRefs: true, lineWidth: -1 });

  // Ensure output directory exists
  const outputDir = path.resolve(__dirname, '..', 'openapi', 'v1');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'api.yaml');
  fs.writeFileSync(outputPath, yamlString, 'utf8');

  console.log(`OpenAPI specification written successfully to: ${outputPath}`);
  
  await app.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to generate OpenAPI specification:', err);
  process.exit(1);
});
