import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Public } from '../../common/public.decorator';
import { AuthService } from './auth.service';

class LineLoginDto {
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
  loginWithLine(@Body() dto: LineLoginDto) {
    return this.authService.loginWithLineIdToken(dto.idToken);
  }
}
