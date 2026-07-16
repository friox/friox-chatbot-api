import { TOKENS } from '@/common/constants/di-tokens';
import { ChatRequestDto } from '@/common/dto/chat-request.dto';
import { ChatResponseDto } from '@/common/dto/chat-response.dto';
import { ChatbotException } from '@/common/errors/chatbot.exception';
import { ERROR_REGISTRY, ErrorCode } from '@/common/errors/error-code';
import { ContextConverter } from '@/common/utils/context.converter';
import { CommandService } from '@/modules/command/command.service';
import { chatMessages, chatSessions, sessionConfigs } from '@/modules/database/schema';
import { GeminiService } from '@/modules/gemini/gemini.service';
import { ReactionService } from '@/modules/reaction/reaction.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(TOKENS.DATABASE_CONNECTION)
    private readonly db: BetterSQLite3Database,
    private readonly reactionService: ReactionService,
    private readonly commandService: CommandService,
    private readonly geminiService: GeminiService,
  ) {}

  async handleChat(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const isGroup = !!dto.groupId;
    const targetId = isGroup ? dto.groupId : dto.userId;
    const sessionId = `${targetId}:${dto.platform}`;

    try {
      // ChatSession 체크 및 생성
      await this.db
        .insert(chatSessions)
        .values({ id: sessionId })
        .onConflictDoNothing();

      // Message 기록
      await this.db
        .insert(chatMessages)
        .values({
          sessionId: sessionId,
          senderName: dto.userName,
          senderId: dto.userId,
          message: dto.message,
          mediaUrls: dto.mediaUrls,
        });

      // SessionConfig 체크 및 생성
      await this.db
        .insert(sessionConfigs)
        .values({ sessionId })
        .onConflictDoNothing();

      // SessionConfig 로드
      const sessionConfig = this.db
        .select()
        .from(sessionConfigs)
        .where(eq(sessionConfigs.sessionId, sessionId))
        .get()!;

      const commandTrigger = '!' + sessionConfig.botTriggerWord;

      if (dto.message.startsWith(commandTrigger)) {
        // Command 핸들링
        const ctx = ContextConverter.toCommandContext(dto, sessionConfig);
        const commandResponse = await this.commandService.handleCommand(ctx);
        if (commandResponse) {
          return commandResponse;
        }
      } else if (sessionConfig.aiEnabled && dto.message.includes(sessionConfig.aiTriggerWord)) {
        // Gemini 핸들링
        const ctx = ContextConverter.toGeminiContext(dto, sessionConfig);
        const response = await this.geminiService.generateChatResponse(ctx);
        if (response) {
          return ChatResponseDto.text(response);
        }
      } else {
        // Reaction 핸들링
        const ctx = ContextConverter.toReactionContext(dto, sessionConfig);
        const reactionResponse = await this.reactionService.handleMessage(ctx);
        if (reactionResponse) {
          return reactionResponse;
        }
      }

      return ChatResponseDto.ignore();
    } catch (error) {
      if (error instanceof ChatbotException) {
        return ChatResponseDto.error(error.userMessage, error.errorCode);
      }

      this.logger.error(error.message);
      const unknownError = ERROR_REGISTRY[ErrorCode.UNKNOWN_ERROR];
      return ChatResponseDto.error(unknownError.userMessage, ErrorCode.UNKNOWN_ERROR);
    }
  }
}
