import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { messagingApi } from '@line/bot-sdk';
import { LINE_MESSAGING_CLIENT, LineReplyService } from './line-reply.service';
import { WebhookController } from './webhook.controller';

@Module({
  controllers: [WebhookController],
  providers: [
    {
      provide: LINE_MESSAGING_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new messagingApi.MessagingApiClient({
          channelAccessToken: configService.get<string>('LINE_CHANNEL_ACCESS_TOKEN') ?? '',
        }),
    },
    LineReplyService,
  ],
})
export class LineModule {}
