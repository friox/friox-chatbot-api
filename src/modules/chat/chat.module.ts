import { CommandModule } from '@/modules/command/command.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { GeminiModule } from '@/modules/gemini/gemini.module';
import { ReactionModule } from '@/modules/reaction/reaction.module';
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [ReactionModule, CommandModule, GeminiModule, DatabaseModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
