import * as fs from 'fs';
import { CORE_SECURITY_AND_PROTOCOL_PROMPT } from './constants/system-prompt.constant';
import { PromptService } from './prompt.service';

jest.mock('fs');

describe('PromptService', () => {
  let promptService: PromptService;
  const mockedFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    promptService = new PromptService();
  });

  describe('getGlobalPrompt & buildSystemInstruction', () => {
    it('전역 프롬프트 파일이 존재하지 않는 경우 Core 프롬프트만 반환해야 한다', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const instruction = promptService.buildSystemInstruction();

      expect(mockedFs.existsSync).toHaveBeenCalled();
      expect(instruction).toBe(CORE_SECURITY_AND_PROTOCOL_PROMPT);
    });

    it('전역 프롬프트 파일 읽기 중 오류 발생 시 예외를 던지지 않고 Core 프롬프트만 반환해야 한다', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      const instruction = promptService.buildSystemInstruction();

      expect(instruction).toBe(CORE_SECURITY_AND_PROTOCOL_PROMPT);
    });

    it('전역 프롬프트 파일이 존재하는 경우 Core와 Global 프롬프트를 구분자로 결합해야 한다', () => {
      const globalContent = '전역 페르소나 지침입니다.';
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(globalContent);

      const instruction = promptService.buildSystemInstruction();

      expect(instruction).toBe(
        `${CORE_SECURITY_AND_PROTOCOL_PROMPT}\n\n---\n\n${globalContent}`,
      );
    });

    it('세션 프롬프트가 주어졌을 때 Core, Global, Session 프롬프트를 모두 결합해야 한다', () => {
      const globalContent = '전역 페르소나 지침';
      const sessionContent = '세션 커스텀 지침';
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(globalContent);

      const instruction = promptService.buildSystemInstruction(sessionContent);

      expect(instruction).toBe(
        `${CORE_SECURITY_AND_PROTOCOL_PROMPT}\n\n---\n\n${globalContent}\n\n---\n\n${sessionContent}`,
      );
    });

    it('전역 프롬프트 파일이 없고 세션 프롬프트만 주어졌을 때 Core와 Session 프롬프트만 결합해야 한다', () => {
      const sessionContent = '세션 커스텀 지침';
      mockedFs.existsSync.mockReturnValue(false);

      const instruction = promptService.buildSystemInstruction(sessionContent);

      expect(instruction).toBe(
        `${CORE_SECURITY_AND_PROTOCOL_PROMPT}\n\n---\n\n${sessionContent}`,
      );
    });

    it('공백이나 빈 문자열 프롬프트는 필터링되어 결합되지 않아야 한다', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('   ');

      const instruction = promptService.buildSystemInstruction('   ');

      expect(instruction).toBe(CORE_SECURITY_AND_PROTOCOL_PROMPT);
    });

    it('캐싱된 결과를 재사용하고 reloadGlobalPrompt 호출 시 다시 읽어야 한다', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('1차 프롬프트');

      expect(promptService.buildSystemInstruction()).toContain('1차 프롬프트');
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);

      // 두 번째 호출 시 캐시 사용 (readFileSync 추가 호출 없음)
      promptService.buildSystemInstruction();
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);

      // reload 호출 후 재읽기
      mockedFs.readFileSync.mockReturnValue('2차 프롬프트');
      promptService.reloadGlobalPrompt();
      expect(promptService.buildSystemInstruction()).toContain('2차 프롬프트');
      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(2);
    });
  });
});
