import { GeminiContext } from '@/common/contexts/chat-domain.context';
import * as schema from '@/modules/database/schema';
import { GoogleGenAI } from '@google/genai';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { GeminiService } from './gemini.service';
import { PromptService } from './prompt.service';

describe('GeminiService', () => {
  let geminiService: GeminiService;
  let mockDb: Partial<BetterSQLite3Database<typeof schema>>;
  let mockAi: { interactions: { create: jest.Mock } };
  let mockPromptService: Partial<PromptService>;

  beforeEach(() => {
    mockDb = {
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      }),
    };

    mockAi = {
      interactions: {
        create: jest.fn().mockResolvedValue({
          id: 'interaction-123',
          output_text: '테스트 응답입니다.',
        }),
      },
    };

    mockPromptService = {
      buildSystemInstruction: jest
        .fn()
        .mockReturnValue('합성된_시스템_인스트럭션'),
    };

    geminiService = new GeminiService(
      mockDb as unknown as BetterSQLite3Database<typeof schema>,
      mockAi as unknown as GoogleGenAI,
      mockPromptService as PromptService,
    );
  });

  it('generateChatResponse 호출 시 promptService.buildSystemInstruction을 호출하고 system_instruction에 전달해야 한다', async () => {
    const ctx: GeminiContext = {
      sessionId: 'session-1',
      senderId: 'user-1',
      senderName: '홍길동',
      platform: 'discord',
      prompt: '안녕',
      mediaUrls: [],
      sessionPrompt: '특정 세션 프롬프트',
    };

    const response = await geminiService.generateChatResponse(ctx);

    expect(mockPromptService.buildSystemInstruction).toHaveBeenCalledWith(
      '특정 세션 프롬프트',
    );
    expect(mockAi.interactions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        system_instruction: '합성된_시스템_인스트럭션',
        model: 'gemini-3.5-flash-lite',
      }),
    );
    expect(response).toBe('테스트 응답입니다.');
  });
});
