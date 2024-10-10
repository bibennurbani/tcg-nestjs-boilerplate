import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository, // Mock the repository
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userDto = { username: 'testuser', password: 'testpass' };
      const createdUser = { id: 1, ...userDto };

      mockUserRepository.create.mockReturnValue(createdUser); // Mock the create method
      mockUserRepository.save.mockResolvedValue(createdUser); // Mock the save method

      const result = await service.createUser(
        userDto.username,
        userDto.password,
      );

      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(userDto);
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', async () => {
      const username = 'testuser';
      const foundUser = { id: 1, username };

      mockUserRepository.findOne.mockResolvedValue(foundUser); // Mock the findOne method

      const result = await service.findOneByUsername(username);

      expect(result).toEqual(foundUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const id = '1';
      const foundUser = { id, username: 'testuser' };

      mockUserRepository.findOne.mockResolvedValue(foundUser); // Mock the findOne method

      const result = await service.findOneById(id);

      expect(result).toEqual(foundUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
