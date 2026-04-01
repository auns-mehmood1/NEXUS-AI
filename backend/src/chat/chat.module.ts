import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Session, SessionSchema } from './schemas/session.schema';
import { AiModule } from '../ai/ai.module';
import { ModelsModule } from '../models/models.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    AiModule,
    ModelsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
