import { HttpStatus } from '@nestjs/common';

/** Business-rule failure that maps to an HTTP response with a stable machine-readable `code`. */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly httpStatus: HttpStatus = HttpStatus.CONFLICT,
  ) {
    super(message);
  }
}

export class NoValidAssignmentError extends DomainError {
  constructor(reason: string) {
    super('NO_VALID_ASSIGNMENT', reason, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
