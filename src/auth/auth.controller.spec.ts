import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { User } from '../users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const mockUser = {
      id: 1,
      username: 'test',
      email: 'test@example.com',
      password: 'hashedpassword123', // Add password field
      isActive: true, // Add isActive field
      isEmailVerified: false, // Add isEmailVerified field
    } as unknown as User;
    jest.spyOn(authService, 'register').mockResolvedValue(mockUser);

    const result = await controller.register({
      username: 'test',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockUser);
  });

  it('should reset password', async () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'test-token',
      newPassword: 'new-password123',
    };

    const result = await controller.resetPassword(resetPasswordDto);

    expect(authService.resetPassword).toHaveBeenCalledWith(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    expect(result).toEqual({ message: 'Password updated successfully' });
  });
});
