import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EVENT_STATUS } from '@line-oa-randomizer/shared';
import { SWAGGER_EXAMPLE } from '../../../common/swagger/examples';

export class CreateEventDto {
  @ApiProperty({ type: String, example: 'คริสต์มาสออฟฟิศ', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ type: String, example: 'ของขวัญไม่เกินงบที่ตั้งไว้', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: Number, example: 500, minimum: 0, maximum: 10_000_000, description: 'Budget in baht.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  budget?: number;

  @ApiPropertyOptional({ type: String, example: '2026-12-25T00:00:00.000Z', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  exchangeDate?: string;

  @ApiPropertyOptional({ type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  allowViewAllResults?: boolean;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {
  /** The only status an organizer can set by hand; DRAWN comes from drawing. */
  @ApiPropertyOptional({
    type: String,
    enum: [EVENT_STATUS.CLOSED],
    example: EVENT_STATUS.CLOSED,
    description: 'The only status an organizer can set by hand. DRAWN comes from drawing.',
  })
  @IsOptional()
  @IsIn([EVENT_STATUS.CLOSED])
  status?: typeof EVENT_STATUS.CLOSED;
}

export class JoinEventDto {
  @ApiProperty({ type: String, example: SWAGGER_EXAMPLE.inviteCode })
  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}

export class ListEventsQueryDto {
  @ApiPropertyOptional({ type: String, enum: ['organized', 'joined'], example: 'joined' })
  @IsOptional()
  @IsIn(['organized', 'joined'])
  scope?: 'organized' | 'joined';
}
