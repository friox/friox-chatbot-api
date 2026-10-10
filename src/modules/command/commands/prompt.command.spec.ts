import { CommandContext } from '@/common/contexts/chat-domain.context';
import * as schema from '@/modules/database/schema';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { PromptCommand } from './prompt.command';

describe('PromptCommand', () => {
  let promptCommand: PromptCommand;
  let mockUpdate: jest.Mock;
  let mockUpdateSet: jest.Mock;
  let mockUpdateWhere: jest.Mock;
  let mockSelect: jest.Mock;
  let mockSelectFrom: jest.Mock;
  let mockSelectWhere: jest.Mock;
  let mockSelectGet: jest.Mock;

  beforeEach(() => {
    mockUpdateWhere = jest.fn().mockResolvedValue({});
    mockUpdateSet = jest.fn().mockReturnValue({ where: mockUpdateWhere });
    mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });

    mockSelectGet = jest.fn();
    mockSelectWhere = jest.fn().mockReturnValue({ get: mockSelectGet });
    mockSelectFrom = jest.fn().mockReturnValue({ where: mockSelectWhere });
    mockSelect = jest.fn().mockReturnValue({ from: mockSelectFrom });

    const mockDb = {
      update: mockUpdate as unknown as BetterSQLite3Database<
        typeof schema
      >['update'],
      select: mockSelect as unknown as BetterSQLite3Database<
        typeof schema
      >['select'],
    } as unknown as BetterSQLite3Database<typeof schema>;

    promptCommand = new PromptCommand(mockDb);
  });

  const createCtx = (args: string[]): CommandContext => ({
    sessionId: 'session-1',
    senderId: 'user-1',
    command: '프롬프트',
    args,
  });

  describe('조회 (promptGet)', () => {
    it('인자가 없거나 "조회"일 때 설정된 프롬프트가 있으면 내용을 반환해야 한다', async () => {
      mockSelectGet.mockReturnValue({ systemPrompt: '기존 커스텀 프롬프트' });

      const res = await promptCommand.execute(createCtx([]));

      expect(res.text).toContain('기존 커스텀 프롬프트');
    });

    it('인자가 "확인"이고 설정된 프롬프트가 없으면 기본 안내 메시지를 반환해야 한다', async () => {
      mockSelectGet.mockReturnValue({ systemPrompt: null });

      const res = await promptCommand.execute(createCtx(['확인']));

      expect(res.text).toContain('설정된 세션 커스텀 프롬프트가 없습니다');
    });
  });

  describe('수정 (promptUpdate)', () => {
    it('수정할 내용이 없으면 안내 메시지를 반환해야 한다', async () => {
      const res = await promptCommand.execute(createCtx(['수정']));

      expect(res.text).toContain('수정할 프롬프트 내용을 입력해주세요');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('수정할 내용이 2000자를 초과하면 에러 안내 메시지를 반환해야 한다', async () => {
      const longText = 'a'.repeat(2001);
      const res = await promptCommand.execute(createCtx(['수정', longText]));

      expect(res.text).toContain('최대 2000자까지');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('정상적인 프롬프트 수정 시 systemPrompt가 저장되고 previousInteractionId가 null로 리셋되어야 한다', async () => {
      const res = await promptCommand.execute(
        createCtx(['수정', '친절한', '고양이로', '답변해줘']),
      );

      expect(mockUpdate).toHaveBeenCalledWith(schema.sessionConfigs);
      expect(mockUpdateSet).toHaveBeenCalledWith({
        systemPrompt: '친절한 고양이로 답변해줘',
        previousInteractionId: null,
      });
      expect(mockUpdateWhere).toHaveBeenCalled();
      expect(res.text).toContain('세션 커스텀 프롬프트가 수정되었습니다');
      expect(res.text).toContain(
        '시스템 프롬프트가 수정되어 세션이 초기화됩니다',
      );
    });

    it('"설정" 서브커맨드로도 프롬프트가 정상 수정되어야 한다', async () => {
      const res = await promptCommand.execute(
        createCtx(['설정', '새로운 지침']),
      );

      expect(mockUpdateSet).toHaveBeenCalledWith({
        systemPrompt: '새로운 지침',
        previousInteractionId: null,
      });
      expect(res.text).toContain('세션 커스텀 프롬프트가 수정되었습니다');
      expect(res.text).toContain(
        '시스템 프롬프트가 수정되어 세션이 초기화됩니다',
      );
    });
  });

  describe('초기화 (promptReset)', () => {
    it('"초기화" 명령 시 systemPrompt와 previousInteractionId가 모두 null로 리셋되어야 한다', async () => {
      const res = await promptCommand.execute(createCtx(['초기화']));

      expect(mockUpdate).toHaveBeenCalledWith(schema.sessionConfigs);
      expect(mockUpdateSet).toHaveBeenCalledWith({
        systemPrompt: null,
        previousInteractionId: null,
      });
      expect(mockUpdateWhere).toHaveBeenCalled();
      expect(res.text).toContain('세션 커스텀 프롬프트가 초기화되었습니다');
      expect(res.text).toContain(
        '시스템 프롬프트가 수정되어 세션이 초기화됩니다',
      );
    });

    it('"삭제" 명령으로도 초기화가 정상 수행되어야 한다', async () => {
      const res = await promptCommand.execute(createCtx(['삭제']));

      expect(mockUpdateSet).toHaveBeenCalledWith({
        systemPrompt: null,
        previousInteractionId: null,
      });
      expect(res.text).toContain('세션 커스텀 프롬프트가 초기화되었습니다');
      expect(res.text).toContain(
        '시스템 프롬프트가 수정되어 세션이 초기화됩니다',
      );
    });
  });

  describe('알 수 없는 서브커맨드', () => {
    it('지원하지 않는 서브커맨드 입력 시 사용법 안내를 반환해야 한다', async () => {
      const res = await promptCommand.execute(createCtx(['알수없음']));

      expect(res.text).toContain('올바른 명령어를 확인해주세요');
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
