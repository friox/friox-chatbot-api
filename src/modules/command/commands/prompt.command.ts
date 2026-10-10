import { TOKENS } from '@/common/constants/di-tokens';
import { CommandContext } from '@/common/contexts/chat-domain.context';
import { ChatResponseDto } from '@/common/dto/chat-response.dto';
import { ChatCommand } from '@/modules/command/interfaces/chat-command.interface';
import * as schema from '@/modules/database/schema';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

@Injectable()
export class PromptCommand implements ChatCommand {
  private readonly logger = new Logger(PromptCommand.name);
  private static readonly MAX_PROMPT_LENGTH = 2000;

  constructor(
    @Inject(TOKENS.DATABASE_CONNECTION)
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  readonly trigger = '프롬프트';
  readonly description = '세션 커스텀 프롬프트를 조회, 수정 또는 초기화합니다.';
  readonly usage = '!호출어 프롬프트 [조회 | 수정 <내용> | 초기화]';

  async execute(ctx: CommandContext): Promise<ChatResponseDto> {
    const [subCommand, ...rest] = ctx.args;

    if (!subCommand || subCommand === '조회' || subCommand === '확인') {
      return this.promptGet(ctx.sessionId);
    }

    if (subCommand === '수정' || subCommand === '설정') {
      const content = rest.join(' ').trim();
      return this.promptUpdate(ctx.sessionId, content);
    }

    if (subCommand === '초기화' || subCommand === '삭제') {
      return this.promptReset(ctx.sessionId);
    }

    return ChatResponseDto.text(
      `올바른 명령어를 확인해주세요.\n\n` +
        `• 조회: !호출어 프롬프트 [조회]\n` +
        `• 수정: !호출어 프롬프트 수정 <내용>\n` +
        `• 초기화: !호출어 프롬프트 초기화`,
    );
  }

  private promptGet(sessionId: string): ChatResponseDto {
    const config = this.db
      .select({ systemPrompt: schema.sessionConfigs.systemPrompt })
      .from(schema.sessionConfigs)
      .where(eq(schema.sessionConfigs.sessionId, sessionId))
      .get();

    if (config?.systemPrompt && config.systemPrompt.trim().length > 0) {
      return ChatResponseDto.text(
        `[현재 설정된 세션 커스텀 프롬프트]\n\n${config.systemPrompt}`,
      );
    }

    return ChatResponseDto.text('현재 설정된 세션 커스텀 프롬프트가 없습니다.');
  }

  private async promptUpdate(
    sessionId: string,
    newPrompt: string,
  ): Promise<ChatResponseDto> {
    if (!newPrompt || newPrompt.length === 0) {
      return ChatResponseDto.text(
        '수정할 프롬프트 내용을 입력해주세요.\n' +
          '사용법: !호출어 프롬프트 수정 <설정할 내용>\n' +
          '예시: !호출어 프롬프트 수정 모든 답변은 한국어(영어) 형식을 지켜줘.',
      );
    }

    if (newPrompt.length > PromptCommand.MAX_PROMPT_LENGTH) {
      return ChatResponseDto.text(
        `프롬프트는 최대 ${PromptCommand.MAX_PROMPT_LENGTH}자까지 설정할 수 있습니다. (현재: ${newPrompt.length}자)`,
      );
    }

    await this.db
      .update(schema.sessionConfigs)
      .set({
        systemPrompt: newPrompt,
        previousInteractionId: null,
      })
      .where(eq(schema.sessionConfigs.sessionId, sessionId));

    this.logger.log(
      `Session prompt updated and previous interaction reset for sessionId: ${sessionId}`,
    );

    return ChatResponseDto.text(
      '세션 커스텀 프롬프트가 수정되었습니다.\n' +
        '시스템 프롬프트가 수정되어 세션이 초기화됩니다.',
    );
  }

  private async promptReset(sessionId: string): Promise<ChatResponseDto> {
    await this.db
      .update(schema.sessionConfigs)
      .set({
        systemPrompt: null,
        previousInteractionId: null,
      })
      .where(eq(schema.sessionConfigs.sessionId, sessionId));

    this.logger.log(`Session prompt reset for sessionId: ${sessionId}`);

    return ChatResponseDto.text(
      '세션 커스텀 프롬프트가 초기화되었습니다.\n' +
        '시스템 프롬프트가 수정되어 세션이 초기화됩니다.',
    );
  }
}
