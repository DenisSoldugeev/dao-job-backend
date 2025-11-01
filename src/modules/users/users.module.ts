import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UsersController],
})
export class UsersModule {}
