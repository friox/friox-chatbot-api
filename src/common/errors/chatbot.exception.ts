import { ERROR_REGISTRY, ErrorCode } from "./error-code";

export class ChatbotException extends Error {
  public readonly errorCode: ErrorCode;
  public readonly userMessage: string;

  constructor(errorCode: ErrorCode, debugMessage?: string) {
    const metadata = ERROR_REGISTRY[errorCode] || ERROR_REGISTRY[ErrorCode.UNKNOWN_ERROR];
    super(debugMessage || metadata.debugMessage);
    this.errorCode = errorCode;
    this.userMessage = metadata.userMessage;
    this.name = 'ChatbotException';
  }
}
