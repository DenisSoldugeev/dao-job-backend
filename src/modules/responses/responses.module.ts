import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ResponsesController } from './responses.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ResponsesController],
})
export class ResponsesModule {}
