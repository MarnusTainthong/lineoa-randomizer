import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import type { AuthResponse } from '@line-oa-randomizer/shared';
import { PrismaService } from '../../prisma/prisma.service';

interface LineVerifiedIdToken {
  sub: string;
  name?: string;
  picture?: string;
}

const LINE_VERIFY_ID_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/verify';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithLineIdToken(idToken: string): Promise<AuthResponse> {
    const verifiedToken = await this.verifyLineIdToken(idToken);
    const user = await this.prisma.user.upsert({
      where: { lineUserId: verifiedToken.sub },
      create: {
        lineUserId: verifiedToken.sub,
        displayName: verifiedToken.name ?? 'ผู้ใช้ LINE',
        pictureUrl: verifiedToken.picture ?? null,
      },
      update: {
        displayName: verifiedToken.name ?? undefined,
        pictureUrl: verifiedToken.picture ?? undefined,
      },
    });
    return this.issueToken(user);
  }

  /** Same JWT shape for real and mock users, so every guard applies equally. */
  async issueToken(user: User): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync({ sub: user.id });
    return {
      accessToken,
      user: { id: user.id, displayName: user.displayName, pictureUrl: user.pictureUrl },
    };
  }

  private async verifyLineIdToken(idToken: string): Promise<LineVerifiedIdToken> {
    const clientId = this.configService.get<string>('LINE_LOGIN_CHANNEL_ID') ?? '';
    if (!clientId) throw new UnauthorizedException('LINE_LOGIN_CHANNEL_ID is not set');

    const response = await fetch(LINE_VERIFY_ID_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
    });
    if (!response.ok) {
      const detail = await lineVerifyError(response);
      throw new UnauthorizedException(lineTokenError(clientId, idToken, detail));
    }

    const body: unknown = await response.json();
    if (!isLineVerifiedIdToken(body)) throw new UnauthorizedException('LINE token ไม่ถูกต้อง');
    return body;
  }
}

/** `aud` is the LINE Login channel that issued the token. Unverified; only used in the error text. */
export function lineIdTokenAudience(idToken: string): string | null {
  const segment = idToken.split('.')[1];
  if (!segment) return null;
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload: unknown = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    if (typeof payload !== 'object' || payload === null || !('aud' in payload)) return null;
    return typeof payload.aud === 'string' ? payload.aud : null;
  } catch {
    return null;
  }
}

export function lineTokenError(clientId: string, idToken: string, lineDetail: string): string {
  const audience = lineIdTokenAudience(idToken);
  const mismatch =
    audience && audience !== clientId ? `audience ${audience} != LINE_LOGIN_CHANNEL_ID ${clientId}` : '';
  const extra = [lineDetail, mismatch].filter(Boolean).join('; ');
  return extra ? `LINE token ไม่ถูกต้อง (${extra})` : 'LINE token ไม่ถูกต้อง';
}

async function lineVerifyError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('error_description' in body)) return '';
  return typeof body.error_description === 'string' ? body.error_description : '';
}

function isLineVerifiedIdToken(value: unknown): value is LineVerifiedIdToken {
  return typeof value === 'object' && value !== null && typeof (value as { sub?: unknown }).sub === 'string';
}
