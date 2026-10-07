import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

const ORIGINAL_ENV = { ...process.env };

async function startApp(extraEnv: Record<string, string>): Promise<{ app: INestApplication; baseUrl: string }> {
  process.env = {
    ...ORIGINAL_ENV,
    DATABASE_URL: 'postgresql://x:x@localhost:5432/x',
    JWT_SECRET: 'test-secret',
    ...extraEnv,
  };
  const moduleRef = await Test.createTestingModule({ imports: [AppModule.register()] })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.listen(0);
  return { app, baseUrl: (await app.getUrl()).replace('[::1]', 'localhost') };
}

describe('app boot', () => {
  let app: INestApplication | undefined;
  afterEach(async () => {
    await app?.close();
    process.env = ORIGINAL_ENV;
  });

  it('wires every module, serves /health publicly and rejects protected routes without a token', async () => {
    const started = await startApp({ DEV_AUTH_ENABLED: 'false' });
    app = started.app;
    expect((await fetch(`${started.baseUrl}/api/health`)).status).toBe(200);
    expect((await fetch(`${started.baseUrl}/api/events`)).status).toBe(401);
  });

  it('returns 404 for /dev/* when dev mode is off', async () => {
    const started = await startApp({ DEV_AUTH_ENABLED: 'false' });
    app = started.app;
    expect((await fetch(`${started.baseUrl}/api/dev/mock-users`)).status).toBe(404);
  });

  it('refuses to boot with dev auth enabled in production', async () => {
    await expect(startApp({ DEV_AUTH_ENABLED: 'true', NODE_ENV: 'production' })).rejects.toThrow(
      /DEV_AUTH_ENABLED/,
    );
  });
});
