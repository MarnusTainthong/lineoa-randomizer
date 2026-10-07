import { Global, Module } from '@nestjs/common';
import { FeasibilityService } from './feasibility.service';

@Global()
@Module({ providers: [FeasibilityService], exports: [FeasibilityService] })
export class FeasibilityModule {}
