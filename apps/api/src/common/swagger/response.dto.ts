import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { EVENT_STATUS, FEASIBILITY, RULE_TYPE } from '@line-oa-randomizer/shared';
import { SWAGGER_EXAMPLE } from './examples';

const EVENT_STATUSES = Object.values(EVENT_STATUS);
const FEASIBILITY_VALUES = Object.values(FEASIBILITY);
const RULE_TYPES = Object.values(RULE_TYPE);

function apiString(example: string | null, extra: ApiPropertyOptions = {}) {
  return ApiProperty({ type: String, example, ...extra });
}

function apiNumber(example: number | null, extra: ApiPropertyOptions = {}) {
  return ApiProperty({ type: Number, example, ...extra });
}

function apiBoolean(example: boolean, extra: ApiPropertyOptions = {}) {
  return ApiProperty({ type: Boolean, example, ...extra });
}

export class ApiErrorDto {
  @apiString('EVENT_NOT_OPEN')
  code!: string;

  @apiString('จับสลากไปแล้ว เข้าร่วมเพิ่มไม่ได้')
  message!: string;
}

export class AuthUserDto {
  @apiString(SWAGGER_EXAMPLE.userId)
  id!: string;

  @apiString('สมชาย')
  displayName!: string;

  @apiString('https://profile.line-scdn.net/example.jpg', { nullable: true })
  pictureUrl!: string | null;
}

export class AuthResponseDto {
  @apiString(SWAGGER_EXAMPLE.accessToken)
  accessToken!: string;

  @ApiProperty({
    type: () => AuthUserDto,
    example: {
      id: SWAGGER_EXAMPLE.userId,
      displayName: 'สมชาย',
      pictureUrl: 'https://profile.line-scdn.net/example.jpg',
    },
  })
  user!: AuthUserDto;
}

export class ParticipantViewDto {
  @apiString(SWAGGER_EXAMPLE.participantId)
  id!: string;

  @apiString('สมชาย')
  displayName!: string;

  @apiString('https://profile.line-scdn.net/example.jpg', { nullable: true })
  pictureUrl!: string | null;

  @apiBoolean(false)
  isGuest!: boolean;

  @apiBoolean(true)
  isMe!: boolean;

  @apiBoolean(true)
  isOrganizer!: boolean;
}

export class EventSummaryDto {
  @apiString(SWAGGER_EXAMPLE.eventId)
  id!: string;

  @apiString('คริสต์มาสออฟฟิศ')
  name!: string;

  @apiString(EVENT_STATUS.OPEN, { enum: EVENT_STATUSES })
  status!: string;

  @apiNumber(500, { nullable: true })
  budget!: number | null;

  @apiString('2026-12-25T00:00:00.000Z', { nullable: true })
  exchangeDate!: string | null;

  @apiNumber(0)
  currentDrawVersion!: number;

  @apiNumber(4)
  participantCount!: number;

  @apiString(SWAGGER_EXAMPLE.inviteCode)
  inviteCode!: string;

  @apiBoolean(true)
  isOrganizer!: boolean;

  @apiBoolean(false, { description: 'True when the user has seen an earlier round and a newer one exists.' })
  hasNewDraw!: boolean;

  @apiString(FEASIBILITY.TOO_FEW_PARTICIPANTS, { enum: FEASIBILITY_VALUES, nullable: true })
  feasibility!: string | null;
}

export class EventDetailDto {
  @apiString(SWAGGER_EXAMPLE.eventId)
  id!: string;

  @apiString('คริสต์มาสออฟฟิศ')
  name!: string;

  @apiString('ของขวัญไม่เกินงบที่ตั้งไว้', { nullable: true })
  description!: string | null;

  @apiNumber(500, { nullable: true })
  budget!: number | null;

  @apiString('2026-12-25T00:00:00.000Z', { nullable: true })
  exchangeDate!: string | null;

  @apiString(SWAGGER_EXAMPLE.inviteCode)
  inviteCode!: string;

  @apiString(EVENT_STATUS.OPEN, { enum: EVENT_STATUSES })
  status!: string;

  @apiBoolean(false)
  allowViewAllResults!: boolean;

  @apiNumber(0)
  currentDrawVersion!: number;

  @apiBoolean(true)
  isOrganizer!: boolean;

  @apiString(FEASIBILITY.TOO_FEW_PARTICIPANTS, {
    enum: FEASIBILITY_VALUES,
    nullable: true,
    description: 'Filled only for the organizer.',
  })
  feasibility!: string | null;

  @apiString('ผู้เข้าร่วมน้อยกว่า 3 คน', { nullable: true })
  feasibilityReason!: string | null;

  @ApiProperty({
    type: () => [ParticipantViewDto],
    example: [
      {
        id: SWAGGER_EXAMPLE.participantId,
        displayName: 'สมชาย',
        pictureUrl: 'https://profile.line-scdn.net/example.jpg',
        isGuest: false,
        isMe: true,
        isOrganizer: true,
      },
    ],
  })
  participants!: ParticipantViewDto[];
}

export class InvitePreviewDto {
  @apiString(SWAGGER_EXAMPLE.eventId)
  eventId!: string;

  @apiString('คริสต์มาสออฟฟิศ')
  name!: string;

  @apiString(EVENT_STATUS.OPEN, { enum: EVENT_STATUSES })
  status!: string;

  @apiBoolean(false)
  isAlreadyJoined!: boolean;
}

export class JoinEventResponseDto {
  @apiString(SWAGGER_EXAMPLE.eventId)
  eventId!: string;
}

export class RuleViewDto {
  @apiString(SWAGGER_EXAMPLE.ruleId)
  id!: string;

  @apiString(RULE_TYPE.MUTUAL_EXCLUDE, { enum: RULE_TYPES })
  type!: string;

  @ApiProperty({
    type: [String],
    example: [SWAGGER_EXAMPLE.participantId, SWAGGER_EXAMPLE.otherParticipantId],
  })
  participantIds!: string[];

  @apiString('คู่รัก ไม่จับกัน', { nullable: true })
  note!: string | null;
}

export class MyResultDto {
  @apiString(SWAGGER_EXAMPLE.eventId)
  eventId!: string;

  @apiString('คริสต์มาสออฟฟิศ')
  eventName!: string;

  @apiNumber(500, { nullable: true })
  budget!: number | null;

  @apiString('2026-12-25T00:00:00.000Z', { nullable: true })
  exchangeDate!: string | null;

  @apiString(EVENT_STATUS.DRAWN, { enum: EVENT_STATUSES })
  status!: string;

  @apiBoolean(false)
  allowViewAllResults!: boolean;

  @apiNumber(1)
  drawVersion!: number;

  @apiString('2026-12-20T09:00:00.000Z', { nullable: true })
  drawnAt!: string | null;

  @apiString('มาลี', { nullable: true, description: 'Null until the draw happens.' })
  receiverName!: string | null;

  @apiBoolean(false)
  hasNewDraw!: boolean;

  @apiBoolean(true)
  hasOpenedCurrent!: boolean;
}

export class ResultHistoryEntryDto {
  @apiNumber(1)
  drawVersion!: number;

  @apiString('2026-12-20T09:00:00.000Z')
  drawnAt!: string;

  @apiString('มาลี')
  receiverName!: string;

  @apiBoolean(true)
  isCurrent!: boolean;

  @apiNumber(1, { nullable: true, description: 'Null when this round predates rule snapshots.' })
  ruleCount!: number | null;
}

export class ResultRowDto {
  @apiString(SWAGGER_EXAMPLE.participantId)
  giverId!: string;

  @apiString('สมชาย')
  giverName!: string;

  @apiString(SWAGGER_EXAMPLE.otherParticipantId)
  receiverId!: string;

  @apiString('มาลี')
  receiverName!: string;
}

export class RoundRuleViewDto {
  @apiString(RULE_TYPE.MUTUAL_EXCLUDE, { enum: RULE_TYPES })
  type!: string;

  @ApiProperty({ type: [String], example: ['สมชาย', 'มาลี'] })
  participantNames!: string[];

  @apiString('คู่รัก', { nullable: true })
  note!: string | null;
}

export class RoundRulesDto {
  @apiBoolean(true)
  recorded!: boolean;

  @ApiProperty({ type: () => [RoundRuleViewDto] })
  rules!: RoundRuleViewDto[];
}

export class RoundResultsDto {
  @apiNumber(1)
  drawVersion!: number;

  @apiString('2026-12-20T09:00:00.000Z', { nullable: true })
  drawnAt!: string | null;

  @ApiProperty({ type: [Number], example: [1] })
  availableVersions!: number[];

  @ApiProperty({
    type: () => [ResultRowDto],
    example: [
      {
        giverId: SWAGGER_EXAMPLE.participantId,
        giverName: 'สมชาย',
        receiverId: SWAGGER_EXAMPLE.otherParticipantId,
        receiverName: 'มาลี',
      },
    ],
  })
  rows!: ResultRowDto[];
}

export class DrawResponseDto {
  @apiNumber(1)
  drawVersion!: number;
}

export class MockUserViewDto {
  @apiString(SWAGGER_EXAMPLE.userId)
  id!: string;

  @apiString('สมชาย')
  displayName!: string;
}

export class HealthResponseDto {
  @apiString('ok')
  status!: string;
}
