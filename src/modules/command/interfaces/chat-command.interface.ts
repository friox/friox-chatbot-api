import { CommandContext } from "src/common/contexts/chat-domain.context";
import { ChatResponseDto } from "src/common/dto/chat-response.dto";

export interface ChatCommand {
  readonly trigger: string;
  readonly description: string;
  readonly usage: string;
  execute(ctx: CommandContext): ChatResponseDto | Promise<ChatResponseDto>;
}
