import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; // For password hashing

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async verifyUser(id: number): Promise<void> {
    await this.usersRepository.update(id, { isEmailVerified: true });
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
  }
}
