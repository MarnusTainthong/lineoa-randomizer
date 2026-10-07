import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/current-user.decorator';
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
  create(@CurrentUserId() userId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.create(userId, dto);
  }

  @Get()
  list(@CurrentUserId() userId: string, @Query() query: ListEventsQueryDto) {
    return this.eventsService.list(userId, query.scope ?? 'joined');
  }

  // Declared before ":id" so "invite" is never read as an event id.
  @Get('invite/:inviteCode')
  previewInvite(@CurrentUserId() userId: string, @Param('inviteCode') inviteCode: string) {
    return this.eventsService.previewInvite(inviteCode, userId);
  }

  @Post('join')
  @HttpCode(200)
  join(@CurrentUserId() userId: string, @Body() dto: JoinEventDto) {
    return this.eventsService.join(dto.inviteCode, userId);
  }

  @Get(':id')
  getDetail(@CurrentUserId() userId: string, @Param('id') eventId: string) {
    return this.eventsService.getDetail(eventId, userId);
  }

  @Patch(':id')
  update(@CurrentUserId() userId: string, @Param('id') eventId: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(eventId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUserId() userId: string, @Param('id') eventId: string) {
    return this.eventsService.remove(eventId, userId);
  }
}
