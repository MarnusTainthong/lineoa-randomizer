import type { webhook } from '@line/bot-sdk';
import type { ConfigService } from '@nestjs/config';
import { LineReplyService, type LineReplyClient } from './line-reply.service';

function createService() {
  const replyMessage = jest.fn().mockResolvedValue({});
  // The client type only exposes replyMessage, so a push call is impossible to write; we also
  // guard at runtime with a pushMessage spy attached to the mock.
  const pushMessage = jest.fn();
  const client = { replyMessage, pushMessage } as unknown as LineReplyClient;
  const configService = { get: () => 'LIFF123' } as unknown as ConfigService;
  return { service: new LineReplyService(client, configService), replyMessage, pushMessage };
}

const followEvent = { type: 'follow', replyToken: 'token-1' } as unknown as webhook.Event;
const textEvent = (text: string) =>
  ({ type: 'message', replyToken: 'token-2', message: { type: 'text', text } }) as unknown as webhook.Event;

describe('LineReplyService', () => {
  it('replies with a welcome message on follow', async () => {
    const { service, replyMessage } = createService();
    await service.handleEvents([followEvent]);
    expect(replyMessage).toHaveBeenCalledTimes(1);
    expect(replyMessage.mock.calls[0][0].messages[0].text).toContain('https://liff.line.me/LIFF123/results');
  });

  it('replies with the results link when the user types "ดูผล"', async () => {
    const { service, replyMessage } = createService();
    await service.handleEvents([textEvent('ดูผล')]);
    expect(replyMessage.mock.calls[0][0].messages[0].text).toContain('/LIFF123/results');
  });

  it('replies with the manage link when the user types "จัดการ"', async () => {
    const { service, replyMessage } = createService();
    await service.handleEvents([textEvent('จัดการ')]);
    expect(replyMessage.mock.calls[0][0].messages[0].text).toContain('/LIFF123/manage');
  });

  it('ignores other text and never calls pushMessage', async () => {
    const { service, replyMessage, pushMessage } = createService();
    await service.handleEvents([textEvent('สวัสดี'), followEvent]);
    expect(replyMessage).toHaveBeenCalledTimes(1);
    expect(pushMessage).not.toHaveBeenCalled();
  });
});
