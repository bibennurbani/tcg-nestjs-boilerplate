import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
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
    return this.authService.register(body.username, body.password);
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
    const decoded = this.jwtService.verify(token);
    const userId = decoded.userId;

    await this.usersService.verifyUser(userId);
    return { message: 'Email verified successfully' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { token, newPassword } = body;
    const decoded = this.jwtService.verify(token);
    const userId = decoded.userId;

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Password updated successfully' };
  }
}
