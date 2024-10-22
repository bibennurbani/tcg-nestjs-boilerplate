import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { ResetPasswordDto } from './dto/ResetPasswordDto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body) {
    try {
      return this.authService.register(
        body.username,
        body.email,
        body.password,
      );
    } catch (err) {
      throw new HttpException(
        'Registration failed :' + err,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.userId;

      await this.authService.verifyUser(userId);
      return { message: 'Email verified successfully' };
    } catch (err) {
      throw new HttpException(
        'Invalid or expired token :' + err,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      const { token, newPassword } = body;
      await this.authService.resetPassword(token, newPassword);

      return { message: 'Password updated successfully' };
    } catch (err) {
      throw new HttpException(
        'Invalid or expired token :' + err,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
