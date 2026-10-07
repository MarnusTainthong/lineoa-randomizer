import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RULE_TYPE, type RuleType } from '@secret-santa/shared';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentUserId } from '../../common/current-user.decorator';
import { RulesService } from './rules.service';

const RULE_TYPES = Object.values(RULE_TYPE);

class CreateRuleDto {
  @IsIn(RULE_TYPES)
  type!: RuleType;

  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  participantIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

class UpdateRuleDto {
  @IsOptional()
  @IsIn(RULE_TYPES)
  type?: RuleType;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  participantIds?: string[];

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
  list(@CurrentUserId() userId: string, @Param('eventId') eventId: string) {
    return this.rulesService.list(eventId, userId);
  }

  @Post()
  create(@CurrentUserId() userId: string, @Param('eventId') eventId: string, @Body() dto: CreateRuleDto) {
    return this.rulesService.create(eventId, userId, dto);
  }

  @Patch(':ruleId')
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
  remove(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Param('ruleId') ruleId: string,
  ) {
    return this.rulesService.remove(eventId, userId, ruleId);
  }
}
