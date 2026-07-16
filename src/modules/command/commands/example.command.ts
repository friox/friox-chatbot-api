import { TOKENS } from "@/common/constants/di-tokens";
import { CommandContext } from "@/common/contexts/chat-domain.context";
import { ChatResponseDto } from "@/common/dto/chat-response.dto";
import { ChatCommand } from "@/modules/command/interfaces/chat-command.interface";
import { Inject, Injectable } from "@nestjs/common";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

@Injectable()
export class ExampleCommand implements ChatCommand {

  // DB 사용 시 생성자를 통해 의존성 주입
  constructor(
    @Inject(TOKENS.DATABASE_CONNECTION)
    private readonly db: BetterSQLite3Database,
  ) {}
  
  trigger = '명령어이름'; // 띄어쓰기 불가능,
  description = '명령어 설명';
  usage = '!호출어 명령어이름 <매개변수1> <매개변수2> ...'; // 명령어 사용법
  async execute(ctx: CommandContext): Promise<ChatResponseDto> {
    const args = ctx.args; // 전달인자 배열

    // 여기에 명령어 코드 작성

    // 반환값은 무조건 ChatResponseDto
    // return ChatResponseDto.media('미디어 URL', '캡션(선택)');
    return ChatResponseDto.text('결과로 보낼 텍스트');
  }
}
