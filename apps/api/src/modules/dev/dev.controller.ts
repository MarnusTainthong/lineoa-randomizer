import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
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
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CurrentUserId } from '../../common/current-user.decorator';
import { Public } from '../../common/public.decorator';
import { SWAGGER_EXAMPLE } from '../../common/swagger/examples';
import { AuthResponseDto, MockUserViewDto } from '../../common/swagger/response.dto';
import { DevService } from './dev.service';

class CreateMockUserDto {
  @ApiPropertyOptional({ type: String, example: 'สมชาย', maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;
}

class MockLoginDto {
  @ApiProperty({ type: String, example: SWAGGER_EXAMPLE.userId })
  @IsString()
  @IsNotEmpty()
  mockUserId!: string;
}

class AddMockParticipantsDto {
  @ApiProperty({ type: Number, example: 5, minimum: 1, maximum: 50 })
  @IsInt()
  @Min(1)
  @Max(50)
  count!: number;
}

/** Only registered when DEV_AUTH_ENABLED=true; otherwise every /dev/* route is a plain 404. */
@ApiTags('dev')
@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Public()
  @Get('mock-users')
  @ApiOkResponse({ type: MockUserViewDto, isArray: true })
  listMockUsers() {
    return this.devService.listMockUsers();
  }

  @Public()
  @Post('mock-users')
  @ApiBody({ type: CreateMockUserDto })
  @ApiCreatedResponse({ type: MockUserViewDto })
  createMockUser(@Body() dto: CreateMockUserDto) {
    return this.devService.createMockUser(dto.displayName);
  }

  @Public()
  @Post('auth/login')
  @HttpCode(200)
  @ApiBody({ type: MockLoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: MockLoginDto) {
    return this.devService.loginAsMockUser(dto.mockUserId);
  }

  @ApiBearerAuth()
  @Post('events/:eventId/mock-participants')
  @HttpCode(204)
  @ApiParam({ name: 'eventId', example: SWAGGER_EXAMPLE.eventId })
  @ApiBody({ type: AddMockParticipantsDto })
  @ApiNoContentResponse()
  addMockParticipants(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Body() dto: AddMockParticipantsDto,
  ) {
    return this.devService.addMockParticipants(eventId, userId, dto.count);
  }
}
