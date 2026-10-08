import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { messagingApi, webhook } from '@line/bot-sdk';

export const LINE_MESSAGING_CLIENT = Symbol('LINE_MESSAGING_CLIENT');

/** The only LINE calls we ever make: reply to a follow or a keyword. The push API is never used. */
export type LineReplyClient = Pick<messagingApi.MessagingApiClient, 'replyMessage'>;

const VIEW_RESULTS_KEYWORDS = ['ดูผล', 'ผล'];
const MANAGE_KEYWORDS = ['จัดการ', 'สร้างห้อง'];

@Injectable()
export class LineReplyService {
  constructor(
    @Inject(LINE_MESSAGING_CLIENT) private readonly client: LineReplyClient,
    private readonly configService: ConfigService,
  ) {}

  async handleEvents(events: webhook.Event[]): Promise<void> {
    for (const event of events) {
      if (event.type === 'follow') {
        await this.reply(event.replyToken, this.buildWelcomeText());
      } else if (event.type === 'message' && event.message.type === 'text') {
        const replyText = this.buildKeywordReply(event.message.text);
        if (replyText && event.replyToken) await this.reply(event.replyToken, replyText);
      }
    }
  }

  private buildWelcomeText(): string {
    return [
      'ยินดีต้อนรับสู่ LINE OA Randomizer',
      'กดเมนูด้านล่างเพื่อสร้างห้องหรือดูผลการสุ่มได้เลย',
      `ดูผล: ${this.buildLiffUrl('/results')}`,
      `เข้าร่วม: ${this.buildLiffUrl('/join')}`,
      `จัดการ: ${this.buildLiffUrl('/manage')}`,
    ].join('\n');
  }

  private buildKeywordReply(text: string): string | null {
    const normalizedText = text.trim();
    if (VIEW_RESULTS_KEYWORDS.includes(normalizedText)) return `ดูผลการสุ่ม\n${this.buildLiffUrl('/results')}`;
    if (MANAGE_KEYWORDS.includes(normalizedText)) return `จัดการการสุ่ม\n${this.buildLiffUrl('/manage')}`;
    return null;
  }

  private buildLiffUrl(path: string): string {
    const key = path.startsWith('/manage')
      ? 'LIFF_ID_MANAGE'
      : path.startsWith('/join')
        ? 'LIFF_ID_JOIN'
        : 'LIFF_ID_RESULTS';
    const liffId = this.configService.get<string>(key) || this.configService.get<string>('LIFF_ID') || '';
    return `https://liff.line.me/${liffId}${path}`;
  }

  private async reply(replyToken: string, text: string): Promise<void> {
    await this.client.replyMessage({ replyToken, messages: [{ type: 'text', text }] });
  }
}
