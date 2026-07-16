import { ReactionContext } from "@/common/contexts/chat-domain.context";
import { ChatResponseDto } from "@/common/dto/chat-response.dto";
import { ReactionRule } from "@/modules/reaction/interfaces/reaction-rule.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExampleRule implements ReactionRule {
  name = "ExampleRule"; // 리액션 규칙 이름
  priority = 1; // 리액션 우선순위, 높을수록 먼저 판단되고 실행됨

  /**
   * 리액션 여부를 결정하는 결정 함수
   * @param ctx 리액션 컨텍스트
   * @returns boolean
   */
  match(ctx: ReactionContext): boolean {
    return ctx.message.includes('안녕');
  }
  
  /**
   * 리액션 실행 함수, match 함수의 결과가 true 일 때 실행 됨
   * @param ctx 리액션 컨텍스트
   * @returns ChatResponseDto
   */
  execute(ctx: ReactionContext): ChatResponseDto {
    return ChatResponseDto.text(`🖐️ ${ctx.senderName}!`);
  }
}
