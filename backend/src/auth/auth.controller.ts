import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class RefreshDto { @IsString() refreshToken: string; }

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) { return this.authService.signup(dto); }

  @Post('login')
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: any) { return user; }

  @Post('refresh')
  refresh(@Body() body: RefreshDto) { return this.authService.refreshTokens(body.refreshToken); }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: any) { return this.authService.logout(user._id); }
}
