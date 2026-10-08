import 'reflect-metadata';
// Load .env before AppModule.register() reads DEV_AUTH_ENABLED.
import { config as loadDotenv } from 'dotenv';
loadDotenv({ path: ['.env', '../../.env'] });

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorDto } from './common/swagger/response.dto';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './common/domain-error.filter';
import { validateEnv } from './config/env.validation';
import { PrismaService } from './prisma/prisma.service';

const nodeRequire = createRequire(__filename);

function deployMigrations(): Promise<void> {
  const prismaCli = nodeRequire.resolve('prisma/build/index.js');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [prismaCli, 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`prisma migrate deploy failed with exit code ${code ?? 'null'}`));
    });
  });
}

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule.register(), { rawBody: true });

  app.setGlobalPrefix('api');
  // The web app is on another host. Helmet's default same-origin policy makes the browser report "Load failed".
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({ origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new DomainErrorFilter());

  if (env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('LINE OA Randomizer API')
      .setVersion('3.4.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, swaggerConfig, { extraModels: [ApiErrorDto] }),
    );
  }

  await app.listen(env.PORT, '0.0.0.0');
  console.log(`API listening on 0.0.0.0:${env.PORT}`);

  if (env.NODE_ENV === 'production') {
    await deployMigrations();
    await app.get(PrismaService).$connect();
  }
}

void bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
