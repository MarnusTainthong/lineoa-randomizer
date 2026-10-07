import { PartialType } from '@nestjs/swagger';
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

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  budget?: number;

  @IsOptional()
  @IsDateString()
  exchangeDate?: string;

  @IsOptional()
  @IsBoolean()
  allowViewAllResults?: boolean;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {
  /** The only status an organizer can set by hand; DRAWN comes from drawing. */
  @IsOptional()
  @IsIn([EVENT_STATUS.CLOSED])
  status?: typeof EVENT_STATUS.CLOSED;
}

export class JoinEventDto {
  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}

export class ListEventsQueryDto {
  @IsOptional()
  @IsIn(['organized', 'joined'])
  scope?: 'organized' | 'joined';
}
