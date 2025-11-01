import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TasksController } from './tasks.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [TasksController],
})
export class TasksModule {}
