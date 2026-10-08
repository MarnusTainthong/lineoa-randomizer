import { lineIdTokenAudience, lineTokenError } from './auth.service';

function idToken(audience: string): string {
  const body = Buffer.from(JSON.stringify({ aud: audience, sub: 'U1' })).toString('base64url');
  return `header.${body}.sig`;
}

describe('lineTokenError', () => {
  it('names the channel mismatch when the token was issued for another LINE Login channel', () => {
    expect(lineIdTokenAudience(idToken('111'))).toBe('111');
    expect(lineTokenError('222', idToken('111'), 'Invalid IdToken audience.')).toBe(
      'LINE token ไม่ถูกต้อง (Invalid IdToken audience.; audience 111 != LINE_LOGIN_CHANNEL_ID 222)',
    );
  });
});
