import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import type { AuthResponse } from '@secret-santa/shared';
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
    const clientId = this.configService.get<string>('LINE_LOGIN_CHANNEL_ID');
    const response = await fetch(LINE_VERIFY_ID_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken, client_id: clientId ?? '' }),
    });
    if (!response.ok) throw new UnauthorizedException('LINE token ไม่ถูกต้อง');

    const body: unknown = await response.json();
    if (!isLineVerifiedIdToken(body)) throw new UnauthorizedException('LINE token ไม่ถูกต้อง');
    return body;
  }
}

function isLineVerifiedIdToken(value: unknown): value is LineVerifiedIdToken {
  return typeof value === 'object' && value !== null && typeof (value as { sub?: unknown }).sub === 'string';
}
