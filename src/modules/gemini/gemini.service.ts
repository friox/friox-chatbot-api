import * as schema from '@/modules/database/schema';
import { GoogleGenAI } from '@google/genai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { TOKENS } from 'src/common/constants/di-tokens';
import { GeminiContext } from 'src/common/contexts/chat-domain.context';
import { ChatbotException } from 'src/common/errors/chatbot.exception';
import { ErrorCode } from 'src/common/errors/error-code';
import { PromptService } from './prompt.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly GEMINI_MODEL = 'gemini-3.5-flash-lite'; // TODO: 모델 동적 교체 구현

  constructor(
    @Inject(TOKENS.DATABASE_CONNECTION)
    private readonly db: BetterSQLite3Database<typeof schema>,
    @Inject(TOKENS.GEMINI_CLIENT) private readonly ai: GoogleGenAI,
    private readonly promptService: PromptService,
  ) {}

  async generateChatResponse(ctx: GeminiContext): Promise<string | undefined> {
    try {
      const systemInstruction = this.promptService.buildSystemInstruction(
        ctx.sessionPrompt,
      );
      const interaction = await this.ai.interactions.create({
        system_instruction: systemInstruction,
        model: this.GEMINI_MODEL,
        input: [
          {
            type: 'text',
            text: `[platform:${ctx.platform},name:${ctx.senderName ?? 'unknown'}]:${ctx.prompt}`,
          },
          ...ctx.mediaUrls.map((url) => ({
            type: 'image' as const,
            uri: url,
            mime_type: 'image/jpeg',
          })),
        ],
        tools: [{ type: 'google_search' }],
        previous_interaction_id: ctx.previousInteractionId,
      });
      await this.db
        .update(schema.sessionConfigs)
        .set({ previousInteractionId: interaction.id })
        .where(eq(schema.sessionConfigs.sessionId, ctx.sessionId));

      return interaction.output_text;
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 400 && ctx.previousInteractionId) {
        await this.db
          .update(schema.sessionConfigs)
          .set({ previousInteractionId: null })
          .where(eq(schema.sessionConfigs.sessionId, ctx.sessionId));
        this.logger.warn('previousInteractionId reset');
        const retryCtx: GeminiContext = {
          ...ctx,
          previousInteractionId: undefined,
        };
        return this.generateChatResponse(retryCtx);
      }
      const message = err.message ?? 'Unknown external API error';
      this.logger.error(message);
      throw new ChatbotException(
        ErrorCode.INVALID_EXTERNAL_API_RESPONSE,
        message,
      );
    }
  }
}
