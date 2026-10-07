import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Public } from '../../common/public.decorator';
import { SWAGGER_EXAMPLE } from '../../common/swagger/examples';
import { AuthResponseDto } from '../../common/swagger/response.dto';
import { AuthService } from './auth.service';

class LineLoginDto {
  @ApiProperty({ type: String, example: SWAGGER_EXAMPLE.lineIdToken, description: 'LINE Login ID token from LIFF.' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('line')
  @ApiBody({ type: LineLoginDto })
  @ApiCreatedResponse({ type: AuthResponseDto })
  loginWithLine(@Body() dto: LineLoginDto) {
    return this.authService.loginWithLineIdToken(dto.idToken);
  }
}
