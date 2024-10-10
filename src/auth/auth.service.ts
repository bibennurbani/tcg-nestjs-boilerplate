import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && bcrypt.compareSync(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await this.usersService.createUser(username, hashedPassword);

    const verificationToken = this.jwtService.sign({ userId: user.id });
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return user;
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new Error('User not found');

    const resetToken = this.jwtService.sign({ userId: user.id });
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  getJwtSecret() {
    return this.configService.get('JWT_SECRET');
  }
}
