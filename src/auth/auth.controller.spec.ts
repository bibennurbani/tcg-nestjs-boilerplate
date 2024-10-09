/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  // Mocking AuthService
  const mockAuthService = {
    register: jest.fn((username, password) => ({
      id: Date.now(),
      username,
      isActive: true,
    })),
    login: jest.fn((user) => ({
      access_token: 'test-token',
      user,
    })),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockLocalAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(LocalAuthGuard)
      .useValue(mockLocalAuthGuard)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return user object', async () => {
      const userDto = { username: 'testuser', password: 'testpass' };
      const result = await authController.register(userDto);

      expect(result).toEqual({
        id: expect.any(Number),
        username: 'testuser',
        isActive: true,
      });
      expect(authService.register).toHaveBeenCalledWith(
        userDto.username,
        userDto.password,
      );
    });
  });

  describe('login', () => {
    it('should return an access token for a valid user', async () => {
      const user = { id: 1, username: 'testuser' };
      const req = { user };
      const result = await authController.login(req);

      expect(result).toEqual({
        access_token: 'test-token',
        user,
      });
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('profile', () => {
    it('should return the current user profile', async () => {
      const user = { id: 1, username: 'testuser' };
      const req = { user };
      const result = await authController.getProfile(req);

      expect(result).toEqual(user);
    });
  });
});
