import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../common/current-user.decorator';
import { SWAGGER_EXAMPLE } from '../../common/swagger/examples';
import {
  EventDetailDto,
  EventSummaryDto,
  InvitePreviewDto,
  JoinEventResponseDto,
} from '../../common/swagger/response.dto';
import {
  CreateEventDto,
  JoinEventDto,
  ListEventsQueryDto,
  UpdateEventDto,
} from './dto/event.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({ type: EventDetailDto })
  create(@CurrentUserId() userId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.create(userId, dto);
  }

  @Get()
  @ApiOkResponse({ type: EventSummaryDto, isArray: true })
  list(@CurrentUserId() userId: string, @Query() query: ListEventsQueryDto) {
    return this.eventsService.list(userId, query.scope ?? 'joined');
  }

  // Declared before ":id" so "invite" is never read as an event id.
  @Get('invite/:inviteCode')
  @ApiParam({ name: 'inviteCode', example: SWAGGER_EXAMPLE.inviteCode })
  @ApiOkResponse({ type: InvitePreviewDto })
  previewInvite(@CurrentUserId() userId: string, @Param('inviteCode') inviteCode: string) {
    return this.eventsService.previewInvite(inviteCode, userId);
  }

  @Post('join')
  @HttpCode(200)
  @ApiBody({ type: JoinEventDto })
  @ApiOkResponse({ type: JoinEventResponseDto })
  join(@CurrentUserId() userId: string, @Body() dto: JoinEventDto) {
    return this.eventsService.join(dto.inviteCode, userId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: SWAGGER_EXAMPLE.eventId })
  @ApiOkResponse({ type: EventDetailDto })
  getDetail(@CurrentUserId() userId: string, @Param('id') eventId: string) {
    return this.eventsService.getDetail(eventId, userId);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: SWAGGER_EXAMPLE.eventId })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ type: EventDetailDto })
  update(@CurrentUserId() userId: string, @Param('id') eventId: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(eventId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiParam({ name: 'id', example: SWAGGER_EXAMPLE.eventId })
  @ApiNoContentResponse()
  remove(@CurrentUserId() userId: string, @Param('id') eventId: string) {
    return this.eventsService.remove(eventId, userId);
  }
}
