import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModelsModule } from './models/models.module';
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';
import { FormsModule } from './forms/forms.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nexusai'
    ),
    AuthModule,
    UsersModule,
    ModelsModule,
    ChatModule,
    UploadModule,
    FormsModule,
    DashboardModule,
    AiModule,
  ],
})
export class AppModule {}
