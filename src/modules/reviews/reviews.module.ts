import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReviewsController } from './reviews.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
