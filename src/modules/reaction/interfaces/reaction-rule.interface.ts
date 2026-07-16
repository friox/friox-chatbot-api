import { ReactionContext } from "src/common/contexts/chat-domain.context";
import { ChatResponseDto } from "src/common/dto/chat-response.dto";

export interface ReactionRule {
  readonly name: string;
  readonly priority: number;
  match(ctx: ReactionContext): boolean | Promise<boolean>;
  execute(ctx: ReactionContext): ChatResponseDto | Promise<ChatResponseDto>;
}
