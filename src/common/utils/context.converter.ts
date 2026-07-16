import { CommandContext, GeminiContext, ReactionContext } from "@/common/contexts/chat-domain.context";
import { ChatRequestDto } from "@/common/dto/chat-request.dto";
import { SessionConfig } from "@/modules/database/schema";

export class ContextConverter {
  static toCommandContext(dto: ChatRequestDto, config: SessionConfig): CommandContext {
    const triggerPrefix = `!${config.botTriggerWord} `;
    const query = dto.message.trim();
    const parts = query.slice(triggerPrefix.length).trim().split(/\s+/);
    return {
      senderId: dto.userId,
      sessionId: config.sessionId,
      command: parts[0],
      args: parts.slice(1),
    };
  }

  static toGeminiContext(dto: ChatRequestDto, config: SessionConfig): GeminiContext {
    return {
      senderId: dto.userId,
      senderName: dto.userName,
      platform: dto.platform,
      sessionId: config.sessionId,
      prompt: dto.message,
      mediaUrls: dto.mediaUrls ?? [],
      previousInteractionId: config.previousInteractionId ?? undefined,
    };
  }

  static toReactionContext(dto: ChatRequestDto, config: SessionConfig): ReactionContext {
    return {
      sessionId: config.sessionId,
      senderId: dto.userId,
      senderName: dto.userName,
      message: dto.message,
    }
  }
}
