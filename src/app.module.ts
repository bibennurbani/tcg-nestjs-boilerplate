import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ConfigModule, EmailModule, AuthModule, UsersModule, DatabaseModule],
  providers: [],
})
export class AppModule {}
