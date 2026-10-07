import { Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/current-user.decorator';
import { SWAGGER_EXAMPLE } from '../../common/swagger/examples';
import { DrawResponseDto } from '../../common/swagger/response.dto';
import { DrawService } from './draw.service';

@ApiTags('draw')
@ApiBearerAuth()
@Controller('events/:eventId')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Post('draw')
  @HttpCode(200)
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiOkResponse({ type: DrawResponseDto })
  draw(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.drawService.draw(eventId, userId, 'DRAW');
  }

  @Post('redraw')
  @HttpCode(200)
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiOkResponse({ type: DrawResponseDto })
  redraw(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.drawService.draw(eventId, userId, 'REDRAW');
  }
}
