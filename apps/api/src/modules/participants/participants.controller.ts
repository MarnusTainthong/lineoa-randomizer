import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';
import { CurrentUserId } from '../../common/current-user.decorator';
import { SWAGGER_EXAMPLE } from '../../common/swagger/examples';
import { ParticipantViewDto } from '../../common/swagger/response.dto';
import { ParticipantsService } from './participants.service';

class AddGuestsDto {
  @ApiProperty({ type: [String], example: ['มาลี', 'ปอ'], maxItems: 200, minItems: 1, maxLength: 60 })
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
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiOkResponse({ type: ParticipantViewDto, isArray: true })
  list(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.participantsService.list(eventId, userId);
  }

  @Post()
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiBody({ type: AddGuestsDto })
  @ApiCreatedResponse({ type: ParticipantViewDto, isArray: true })
  addGuests(@CurrentUserId() userId: string, @Param('eventId') eventId: string, @Body() dto: AddGuestsDto) {
    return this.participantsService.addGuests(eventId, userId, dto.names);
  }

  @Delete(':participantId')
  @HttpCode(204)
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiParam({ name: 'participantId', example: SWAGGER_EXAMPLE.participantId })
  @ApiNoContentResponse()
  remove(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Param('participantId') participantId: string,
  ) {
    return this.participantsService.remove(eventId, userId, participantId);
  }
}
