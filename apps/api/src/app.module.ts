import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { DevModule } from './modules/dev/dev.module';
import { DrawModule } from './modules/draw/draw.module';
import { EventsModule } from './modules/events/events.module';
import { FeasibilityModule } from './modules/feasibility/feasibility.module';
import { LineModule } from './modules/line/line.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { ResultsModule } from './modules/results/results.module';
import { RulesModule } from './modules/rules/rules.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({})
export class AppModule {
  static register(): DynamicModule {
    // Evaluated at boot so DevModule exists only when explicitly enabled (and never in production).
    const env = validateEnv(process.env);
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env', '../../.env'],
          validate: validateEnv,
        }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
        PrismaModule,
        CommonModule,
        FeasibilityModule,
        AuthModule,
        EventsModule,
        ParticipantsModule,
        RulesModule,
        DrawModule,
        ResultsModule,
        LineModule,
        ...(env.DEV_AUTH_ENABLED ? [DevModule] : []),
      ],
      controllers: [HealthController],
      providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    };
  }
}
