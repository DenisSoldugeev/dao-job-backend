import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
// import { TasksModule } from './modules/tasks/tasks.module';
// import { ResponsesModule } from './modules/responses/responses.module';
// import { ReviewsModule } from './modules/reviews/reviews.module';
// import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    // TasksModule,
    // ResponsesModule,
    // ReviewsModule,
    // UploadsModule,
  ],
})
export class AppModule {}
