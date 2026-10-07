import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Skips the global JWT guard (auth login, LINE webhook, health, dev bootstrap). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
