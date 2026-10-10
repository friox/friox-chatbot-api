import { ChatRequestDto } from '@/common/dto/chat-request.dto';
import { SessionConfig } from '@/modules/database/schema';
import { ContextConverter } from './context.converter';

describe('ContextConverter', () => {
  const baseConfig: SessionConfig = {
    sessionId: 'user123:discord',
    botTriggerWord: '잼민이',
    reactionEnabled: true,
    aiEnabled: true,
    aiTriggerWord: '잼민',
    previousInteractionId: 'prev-123',
    systemPrompt: null,
  };

  const baseDto: ChatRequestDto = {
    platform: 'discord',
    userId: 'user123',
    userName: 'Tester',
    message: '안녕 잼민',
  };

  describe('toGeminiContext', () => {
    it('systemPrompt가 null인 경우 sessionPrompt는 undefined여야 한다', () => {
      const ctx = ContextConverter.toGeminiContext(baseDto, baseConfig);

      expect(ctx.sessionId).toBe('user123:discord');
      expect(ctx.previousInteractionId).toBe('prev-123');
      expect(ctx.sessionPrompt).toBeUndefined();
    });

    it('systemPrompt가 설정된 경우 sessionPrompt에 해당 값이 매핑되어야 한다', () => {
      const configWithPrompt: SessionConfig = {
        ...baseConfig,
        systemPrompt: '반말 모드로 대답해줘.',
      };

      const ctx = ContextConverter.toGeminiContext(baseDto, configWithPrompt);

      expect(ctx.sessionPrompt).toBe('반말 모드로 대답해줘.');
    });
  });
});
