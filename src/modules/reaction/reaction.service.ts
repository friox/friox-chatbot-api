import { Inject, Injectable, Logger } from "@nestjs/common";
import { TOKENS } from "src/common/constants/di-tokens";
import { ReactionContext } from "src/common/contexts/chat-domain.context";
import { ChatResponseDto } from "src/common/dto/chat-response.dto";
import { ReactionRule } from "./interfaces/reaction-rule.interface";

@Injectable()
export class ReactionService {
  private readonly logger = new Logger(ReactionService.name);
  private readonly rules: ReactionRule[];
  
  constructor(
    @Inject(TOKENS.REACTION_RULES)
    rules: ReactionRule[],
  ) {
    const rulesArray = Array.isArray(rules) ? rules : [rules];
    this.rules = rulesArray.sort((a, b) => b.priority - a.priority);
    this.logger.log(`Loaded ${this.rules.length} ReactionRules`);
  }

  async handleMessage(ctx: ReactionContext): Promise<ChatResponseDto | null> {
    for (const rule of this.rules) {
      try {
        if (await rule.match(ctx)) {
          return await rule.execute(ctx);
        }
      } catch (error) {

      }
    }
    return null;
  }
}
