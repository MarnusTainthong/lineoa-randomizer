import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    // Railway connects after listen + migrate so /api/health answers while
    // `prisma migrate deploy` is still running. Dev there uses NODE_ENV=staging.
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT_NAME) return;
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
