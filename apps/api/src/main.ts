import 'reflect-metadata';
// Load .env before AppModule.register() reads DEV_AUTH_ENABLED.
import { config as loadDotenv } from 'dotenv';
loadDotenv({ path: ['.env', '../../.env'] });

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './common/domain-error.filter';
import { validateEnv } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule.register(), { rawBody: true });

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({ origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new DomainErrorFilter());

  if (env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder().setTitle('LINE OA Randomizer API').addBearerAuth().build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  await app.listen(env.PORT);
}

void bootstrap();
