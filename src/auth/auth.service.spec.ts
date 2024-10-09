/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock for UsersService
  const mockUsersService = {
    findOneByUsername: jest.fn((username) => {
      if (username === 'existinguser') {
        return { id: 1, username: 'existinguser', password: 'hashedpass' };
      }
      return null;
    }),
    createUser: jest.fn((username, password) => ({
      id: 1,
      username,
      password,
    })),
  };

  // Mock for JwtService
  const mockJwtService = {
    sign: jest.fn((payload) => 'signed-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const result = await authService.validateUser('existinguser', 'password');

      expect(result).toEqual({
        id: 1,
        username: 'existinguser',
      });
      expect(usersService.findOneByUsername).toHaveBeenCalledWith(
        'existinguser',
      );
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password', 'hashedpass');
    });

    it('should return null if user is not found', async () => {
      const result = await authService.validateUser('nonexistent', 'password');
      expect(result).toBeNull();
      expect(usersService.findOneByUsername).toHaveBeenCalledWith(
        'nonexistent',
      );
    });

    it('should return null if password is invalid', async () => {
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      const result = await authService.validateUser(
        'existinguser',
        'wrongpassword',
      );
      expect(result).toBeNull();
      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedpass',
      );
    });
  });

  describe('login', () => {
    it('should return a JWT access token', async () => {
      const user = { id: 1, username: 'existinguser' };
      const result = await authService.login(user);

      expect(result).toEqual({
        access_token: 'signed-jwt-token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
    });
  });

  describe('register', () => {
    it('should hash the password and register the user', async () => {
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedpassword');

      const result = await authService.register('newuser', 'password');

      expect(result).toEqual({
        id: 1,
        username: 'newuser',
        password: 'hashedpassword',
      });
      expect(bcrypt.hashSync).toHaveBeenCalledWith('password', 10);
      expect(usersService.createUser).toHaveBeenCalledWith(
        'newuser',
        'hashedpassword',
      );
    });
  });
});
