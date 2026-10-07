import { Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../common/current-user.decorator';
import { ResultsService } from './results.service';

@ApiTags('results')
@ApiBearerAuth()
@Controller('events/:eventId')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('my-result')
  getMyResult(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.resultsService.getMyResult(eventId, userId);
  }

  @Get('my-result/history')
  getMyHistory(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.resultsService.getMyHistory(eventId, userId);
  }

  @Post('my-result/ack')
  @HttpCode(204)
  acknowledge(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.resultsService.acknowledgeLatestDraw(eventId, userId);
  }

  @Get('guest-results')
  getGuestResults(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Query('version', new ParseIntPipe({ optional: true })) version?: number,
  ) {
    return this.resultsService.getGuestResults(eventId, userId, version);
  }

  @Get('all-results')
  getAllResults(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Query('version', new ParseIntPipe({ optional: true })) version?: number,
  ) {
    return this.resultsService.getAllResults(eventId, userId, version);
  }
}
