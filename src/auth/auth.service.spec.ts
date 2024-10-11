import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let emailService: EmailService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword123',
    isActive: true,
    isEmailVerified: false,
  } as undefined as User;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'mocked-secret';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn(),
            findOneByEmail: jest.fn(),
            createUser: jest.fn(),
            updatePassword: jest.fn(),
            verifyUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and send verification email', async () => {
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedpassword123');
      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser);

      const result = await authService.register(
        'testuser',
        'test@example.com',
        'password123',
      );

      expect(usersService.createUser).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
        'hashedpassword123',
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        'signed-token',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should generate a JWT token for valid user login', async () => {
      const mockPayload = { username: 'testuser', sub: 1 };

      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual({
        access_token: 'signed-token',
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email if user exists', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);

      await authService.sendPasswordResetEmail('test@example.com');

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        'signed-token',
      );
    });

    it('should throw an error if user does not exist', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(undefined);

      await expect(
        authService.sendPasswordResetEmail('test@example.com'),
      ).rejects.toThrow('User not found');
    });
  });
});
