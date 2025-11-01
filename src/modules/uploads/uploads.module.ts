import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadsController } from './uploads.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UploadsController],
})
export class UploadsModule {}
