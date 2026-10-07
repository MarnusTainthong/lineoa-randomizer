import { Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../common/current-user.decorator';
import { SWAGGER_EXAMPLE } from '../../common/swagger/examples';
import { MyResultDto, ResultHistoryEntryDto, RoundResultsDto } from '../../common/swagger/response.dto';
import { ResultsService } from './results.service';

@ApiTags('results')
@ApiBearerAuth()
@Controller('events/:eventId')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('my-result')
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiOkResponse({ type: MyResultDto })
  getMyResult(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.resultsService.getMyResult(eventId, userId);
  }

  @Get('my-result/history')
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiOkResponse({ type: ResultHistoryEntryDto, isArray: true })
  getMyHistory(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.resultsService.getMyHistory(eventId, userId);
  }

  @Post('my-result/ack')
  @HttpCode(204)
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiNoContentResponse()
  acknowledge(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.resultsService.acknowledgeLatestDraw(eventId, userId);
  }

  @Get('guest-results')
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiQuery({ name: 'version', required: false, example: 1, type: Number })
  @ApiOkResponse({ type: RoundResultsDto })
  getGuestResults(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Query('version', new ParseIntPipe({ optional: true })) version?: number,
  ) {
    return this.resultsService.getGuestResults(eventId, userId, version);
  }

  @Get('all-results')
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiQuery({ name: 'version', required: false, example: 1, type: Number })
  @ApiOkResponse({ type: RoundResultsDto })
  getAllResults(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Query('version', new ParseIntPipe({ optional: true })) version?: number,
  ) {
    return this.resultsService.getAllResults(eventId, userId, version);
  }
}
