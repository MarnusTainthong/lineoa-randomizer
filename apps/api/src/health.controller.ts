import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/public.decorator';
import { HealthResponseDto } from './common/swagger/response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  check() {
    return { status: 'ok' };
  }
}
