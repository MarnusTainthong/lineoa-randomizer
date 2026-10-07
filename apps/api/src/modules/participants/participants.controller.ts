import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';
import { CurrentUserId } from '../../common/current-user.decorator';
import { ParticipantsService } from './participants.service';

class AddGuestsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  names!: string[];
}

@ApiTags('participants')
@ApiBearerAuth()
@Controller('events/:eventId/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  list(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.participantsService.list(eventId, userId);
  }

  @Post()
  addGuests(@CurrentUserId() userId: string, @Param('eventId') eventId: string, @Body() dto: AddGuestsDto) {
    return this.participantsService.addGuests(eventId, userId, dto.names);
  }

  @Delete(':participantId')
  @HttpCode(204)
  remove(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Param('participantId') participantId: string,
  ) {
    return this.participantsService.remove(eventId, userId, participantId);
  }
}
