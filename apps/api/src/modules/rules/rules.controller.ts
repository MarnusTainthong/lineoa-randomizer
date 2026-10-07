import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { RULE_TYPE, type RuleType } from '@line-oa-randomizer/shared';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUserId } from '../../common/current-user.decorator';
import { SWAGGER_EXAMPLE } from '../../common/swagger/examples';
import { RuleViewDto } from '../../common/swagger/response.dto';
import { RulesService } from './rules.service';

const RULE_TYPES = Object.values(RULE_TYPE);
const EXAMPLE_PARTICIPANT_IDS = [SWAGGER_EXAMPLE.participantId, SWAGGER_EXAMPLE.otherParticipantId];

class CreateRuleDto {
  @ApiProperty({ type: String, enum: RULE_TYPES, example: RULE_TYPE.MUTUAL_EXCLUDE })
  @IsIn(RULE_TYPES)
  type!: RuleType;

  @ApiProperty({
    type: [String],
    maxItems: 200,
    example: EXAMPLE_PARTICIPANT_IDS,
    description: 'Directed rules (ONE_WAY_EXCLUDE, HISTORY_EXCLUDE, FORCE_ASSIGN) use an ordered [from, to] pair.',
  })
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  participantIds!: string[];

  @ApiPropertyOptional({ type: String, example: 'คู่รัก ไม่จับกัน', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

class UpdateRuleDto {
  @ApiPropertyOptional({ type: String, enum: RULE_TYPES, example: RULE_TYPE.MUTUAL_EXCLUDE })
  @IsOptional()
  @IsIn(RULE_TYPES)
  type?: RuleType;

  @ApiPropertyOptional({ type: [String], maxItems: 200, example: EXAMPLE_PARTICIPANT_IDS })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  participantIds?: string[];

  @ApiPropertyOptional({ type: String, example: 'คู่รัก ไม่จับกัน', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

@ApiTags('rules')
@ApiBearerAuth()
@Controller('events/:eventId/rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiOkResponse({ type: RuleViewDto, isArray: true })
  list(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.rulesService.list(eventId, userId);
  }

  @Post()
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiBody({ type: CreateRuleDto })
  @ApiCreatedResponse({ type: RuleViewDto })
  create(@CurrentUserId() userId: string, @Param('eventId') eventId: string, @Body() dto: CreateRuleDto) {
    return this.rulesService.create(eventId, userId, dto);
  }

  @Patch(':ruleId')
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiParam({ name: 'ruleId', example: SWAGGER_EXAMPLE.ruleId })
  @ApiBody({ type: UpdateRuleDto })
  @ApiOkResponse({ type: RuleViewDto })
  update(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.rulesService.update(eventId, userId, ruleId, dto);
  }

  @Delete(':ruleId')
  @HttpCode(204)
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiParam({ name: 'ruleId', example: SWAGGER_EXAMPLE.ruleId })
  @ApiNoContentResponse()
  remove(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Param('ruleId') ruleId: string,
  ) {
    return this.rulesService.remove(eventId, userId, ruleId);
  }
}
