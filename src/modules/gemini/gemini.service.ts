import * as schema from '@/modules/database/schema';
import { GoogleGenAI } from "@google/genai";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { TOKENS } from "src/common/constants/di-tokens";
import { GeminiContext } from "src/common/contexts/chat-domain.context";
import { ChatbotException } from "src/common/errors/chatbot.exception";
import { ErrorCode } from "src/common/errors/error-code";

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly GEMINI_MODEL = 'gemini-3.1-flash-lite'; // TODO: 모델 동적 교체 구현

  constructor(
    @Inject(TOKENS.DATABASE_CONNECTION) private readonly db: BetterSQLite3Database<typeof schema>,
    @Inject(TOKENS.GEMINI_CLIENT) private readonly ai: GoogleGenAI,
  ) {}

  async generateChatResponse(ctx: GeminiContext): Promise<string | undefined> {
    try {
      const interaction = await this.ai.interactions.create({
        system_instruction: 'dummy',
        model: this.GEMINI_MODEL,
        input: [
          { type: "text", text: `[platform:${ctx.platform},name:${ctx.senderName ?? 'unknown'}]:${ctx.prompt}` },
          ...ctx.mediaUrls.map(url => ({ type: "image" as const, uri: url, mime_type: 'image/jpeg' }))
        ],
        previous_interaction_id: ctx.previousInteractionId,
      });
      await this.db
        .update(schema.sessionConfigs)
        .set({ previousInteractionId: interaction.id })
        .where(eq(schema.sessionConfigs.sessionId, ctx.sessionId));
      
      return interaction.output_text;
    } catch (error) {
      if (error.status && error.status === 400 && ctx.previousInteractionId) {
        await this.db
          .update(schema.sessionConfigs)
          .set({ previousInteractionId: null })
          .where(eq(schema.sessionConfigs.sessionId, ctx.sessionId));
        this.logger.warn('previousInteractionId reset');
        const retryCtx: GeminiContext = {
          ...ctx,
          previousInteractionId: undefined
        };
        return this.generateChatResponse(retryCtx);
      }
      this.logger.error(error.message);
      throw new ChatbotException(ErrorCode.INVALID_EXTERNAL_API_RESPONSE, error.message);
    }
  }
}
