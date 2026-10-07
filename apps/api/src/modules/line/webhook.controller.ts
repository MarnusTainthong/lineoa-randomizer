import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { validateSignature, type webhook } from '@line/bot-sdk';
import type { Request } from 'express';
import { Public } from '../../common/public.decorator';
import { LineReplyService } from './line-reply.service';

@ApiTags('line')
@Controller('line')
export class WebhookController {
  constructor(
    private readonly lineReplyService: LineReplyService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiHeader({ name: 'x-line-signature', required: true, example: 'base64-hmac-sha256-signature' })
  @ApiBody({
    schema: {
      example: {
        destination: 'U1234567890abcdef',
        events: [
          {
            type: 'message',
            replyToken: 'reply-token',
            source: { type: 'user', userId: 'Uabcdef1234567890' },
            timestamp: 1710000000000,
            mode: 'active',
            webhookEventId: '01EXAMPLE',
            deliveryContext: { isRedelivery: false },
            message: { type: 'text', id: '1', text: 'สวัสดี' },
          },
        ],
      },
    },
  })
  @ApiOkResponse({ schema: { example: {} } })
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-line-signature') signature: string | undefined,
  ): Promise<Record<string, never>> {
    const channelSecret = this.configService.get<string>('LINE_CHANNEL_SECRET') ?? '';
    const rawBody = request.rawBody;
    if (!signature || !rawBody || !validateSignature(rawBody, channelSecret, signature)) {
      throw new UnauthorizedException('invalid signature');
    }

    const body = request.body as Partial<webhook.CallbackRequest>;
    if (!Array.isArray(body.events)) throw new BadRequestException();

    await this.lineReplyService.handleEvents(body.events);
    return {};
  }
}
