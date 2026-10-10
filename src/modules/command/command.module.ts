import { DatabaseModule } from '@/modules/database/database.module';
import { Module } from '@nestjs/common';
import { TOKENS } from 'src/common/constants/di-tokens';
import { CommandService } from './command.service';
import { PromptCommand } from './commands/prompt.command';
import { SatelliteGk2aCommand } from './commands/satellite-gk2a.command';
import { ChatCommand } from './interfaces/chat-command.interface';

export const CHAT_COMMAND_CLASSES = [SatelliteGk2aCommand, PromptCommand];

@Module({
  imports: [DatabaseModule],
  providers: [
    ...CHAT_COMMAND_CLASSES,
    {
      provide: TOKENS.CHAT_COMMANDS,
      useFactory: (...commands: ChatCommand[]) => commands,
      inject: CHAT_COMMAND_CLASSES,
    },
    CommandService,
  ],
  exports: [CommandService],
})
export class CommandModule {}
