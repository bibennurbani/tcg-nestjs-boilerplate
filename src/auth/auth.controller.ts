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
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/ResetPasswordDto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private usersService: UsersService,
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

      await this.usersService.verifyUser(userId);
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
      const decoded = this.jwtService.verify(token);
      const userId = decoded.userId;

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(userId, hashedPassword);

      return { message: 'Password updated successfully' };
    } catch (err) {
      throw new HttpException(
        'Invalid or expired token :' + err,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
