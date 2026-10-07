import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/** Injects the authenticated user's id (set by JwtAuthGuard). */
export const CurrentUserId = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.userId) throw new Error('CurrentUserId used on a route without JwtAuthGuard');
  return request.userId;
});
