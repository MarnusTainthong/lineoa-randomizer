import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { ApiErrorBody } from '@line-oa-randomizer/shared';
import type { Response } from 'express';
import { DomainError } from './domain-error';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(error: DomainError, host: ArgumentsHost): void {
    const body: ApiErrorBody = { code: error.code, message: error.message };
    host.switchToHttp().getResponse<Response>().status(error.httpStatus).json(body);
  }
}
