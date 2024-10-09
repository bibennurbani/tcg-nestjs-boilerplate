import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Register the User entity
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for use in AuthModule
})
export class UsersModule {}
