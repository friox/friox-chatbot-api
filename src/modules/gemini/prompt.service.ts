import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CORE_SECURITY_AND_PROTOCOL_PROMPT } from './constants/system-prompt.constant';

@Injectable()
export class PromptService {
  private readonly logger = new Logger(PromptService.name);
  private readonly promptFilePath = path.join(
    process.cwd(),
    'prompts',
    'system.prompt.md',
  );
  private cachedGlobalPrompt: string | null = null;
  private isLoaded = false;

  /**
   * 전역 시스템 프롬프트(prompts/system.prompt.md)를 로드합니다.
   * 파일이 없거나 오류 발생 시 graceful하게 undefined를 반환합니다.
   */
  getGlobalPrompt(): string | undefined {
    if (this.isLoaded) {
      return this.cachedGlobalPrompt ?? undefined;
    }

    this.reloadGlobalPrompt();
    return this.cachedGlobalPrompt ?? undefined;
  }

  /**
   * 전역 시스템 프롬프트 캐시를 새로고침합니다.
   */
  reloadGlobalPrompt(): void {
    try {
      if (fs.existsSync(this.promptFilePath)) {
        const content = fs.readFileSync(this.promptFilePath, 'utf-8').trim();
        this.cachedGlobalPrompt = content.length > 0 ? content : null;
        this.logger.log(
          `Global system prompt loaded from ${this.promptFilePath}`,
        );
      } else {
        this.cachedGlobalPrompt = null;
        this.logger.warn(
          `Global system prompt file not found at ${this.promptFilePath}. Global prompt will be omitted.`,
        );
      }
    } catch (error) {
      this.cachedGlobalPrompt = null;
      this.logger.warn(
        `Failed to read global system prompt file: ${error instanceof Error ? error.message : error}. Global prompt will be omitted.`,
      );
    } finally {
      this.isLoaded = true;
    }
  }

  /**
   * Core 보안 프롬프트, 전역 프롬프트, 세션 프롬프트를 계층적으로 합성합니다.
   *
   * @param sessionPrompt 특정 세션에 설정된 커스텀 프롬프트
   * @returns 합성된 최종 system_instruction 문자열
   */
  buildSystemInstruction(sessionPrompt?: string): string {
    const globalPrompt = this.getGlobalPrompt();
    const trimmedSession = sessionPrompt?.trim();
    const formattedSession =
      trimmedSession && trimmedSession.length > 0
        ? `# Session Custom Instructions\n${trimmedSession}`
        : undefined;

    const sections = [
      CORE_SECURITY_AND_PROTOCOL_PROMPT,
      globalPrompt?.trim(),
      formattedSession,
    ].filter(
      (section): section is string =>
        typeof section === 'string' && section.length > 0,
    );

    return sections.join('\n\n---\n\n');
  }
}
