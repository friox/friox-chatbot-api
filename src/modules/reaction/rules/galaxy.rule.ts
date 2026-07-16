import { ReactionContext } from "@/common/contexts/chat-domain.context";
import { ChatResponseDto } from "@/common/dto/chat-response.dto";
import { ReactionRule } from "@/modules/reaction/interfaces/reaction-rule.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GalaxyRule implements ReactionRule {
  name = "GalaxyRule";
  priority = 1;

  match(ctx: ReactionContext): boolean {
    return ctx.message.includes('갤럭시');
  }
  
  execute(ctx: ReactionContext): ChatResponseDto {
    return ChatResponseDto.text('아이폰 쓰세요');
  }
}
