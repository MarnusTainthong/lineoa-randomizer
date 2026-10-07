import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CurrentUserId } from '../../common/current-user.decorator';
import { Public } from '../../common/public.decorator';
import { DevService } from './dev.service';

class CreateMockUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;
}

class MockLoginDto {
  @IsString()
  @IsNotEmpty()
  mockUserId!: string;
}

class AddMockParticipantsDto {
  @IsInt()
  @Min(1)
  @Max(50)
  count!: number;
}

/** Only registered when DEV_AUTH_ENABLED=true; otherwise every /dev/* route is a plain 404. */
@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Public()
  @Get('mock-users')
  listMockUsers() {
    return this.devService.listMockUsers();
  }

  @Public()
  @Post('mock-users')
  createMockUser(@Body() dto: CreateMockUserDto) {
    return this.devService.createMockUser(dto.displayName);
  }

  @Public()
  @Post('auth/login')
  @HttpCode(200)
  login(@Body() dto: MockLoginDto) {
    return this.devService.loginAsMockUser(dto.mockUserId);
  }

  @Post('events/:eventId/mock-participants')
  @HttpCode(204)
  addMockParticipants(
    @CurrentUserId() userId: string,
    @Param('eventId') eventId: string,
    @Body() dto: AddMockParticipantsDto,
  ) {
    return this.devService.addMockParticipants(eventId, userId, dto.count);
  }
}
