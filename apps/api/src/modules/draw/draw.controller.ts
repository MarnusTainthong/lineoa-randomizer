import { Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/current-user.decorator';
import { DrawService } from './draw.service';

@ApiTags('draw')
@ApiBearerAuth()
@Controller('events/:eventId')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Post('draw')
  @HttpCode(200)
  draw(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.drawService.draw(eventId, userId, 'DRAW');
  }

  @Post('redraw')
  @HttpCode(200)
  redraw(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.drawService.draw(eventId, userId, 'REDRAW');
  }
}
