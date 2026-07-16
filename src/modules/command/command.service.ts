import { TOKENS } from "@/common/constants/di-tokens";
import { CommandContext } from "@/common/contexts/chat-domain.context";
import { ChatResponseDto } from "@/common/dto/chat-response.dto";
import { ChatbotException } from "@/common/errors/chatbot.exception";
import { ErrorCode } from "@/common/errors/error-code";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ChatCommand } from "./interfaces/chat-command.interface";

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);
  private readonly commands = new Map<string, ChatCommand>();

  constructor(
    @Inject(TOKENS.CHAT_COMMANDS)
    commands: ChatCommand[],
  ) {
    const commandsArray = Array.isArray(commands) ? commands : [commands];
    for (const cmd of commandsArray) {
      if (!this.commands.has(cmd.trigger)) {
        this.commands.set(cmd.trigger, cmd);
      }
    }
    this.logger.log(`Loaded ${this.commands.size} ChatCommands`);
  }

  async handleCommand(ctx: CommandContext): Promise<ChatResponseDto | null> {
    const command = this.commands.get(ctx.command);
    if (!command) {
      throw new ChatbotException(ErrorCode.COMMAND_NOT_FOUND);
    }
    try {
      return await command.execute(ctx);
    } catch (error) {
      if (error instanceof ChatbotException) {
        throw error;
      }
      throw new ChatbotException(ErrorCode.COMMAND_EXECUTION_FAILED, error.message);
    }
  }
}
