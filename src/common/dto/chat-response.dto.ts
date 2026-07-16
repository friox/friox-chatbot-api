import { ErrorCode } from "@/common/errors/error-code";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from "class-validator";

export enum ChatResponseType {
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  IGNORE = 'IGNORE',
  ERROR = 'ERROR',
}

export class ChatResponseDto {
  @IsBoolean()
  readonly success: boolean;

  @IsEnum(ChatResponseType)
  @IsNotEmpty()
  readonly type: ChatResponseType;

  @ValidateIf(o => o.type === ChatResponseType.TEXT || o.type === ChatResponseType.ERROR)
  @IsString()
  @IsNotEmpty()
  readonly text?: string;
  
  @ValidateIf(o => o.type === ChatResponseType.MEDIA)
  @IsUrl({}, { message: 'mediaUrl is not valid' })
  @IsNotEmpty()
  readonly url?: string;

  @IsString()
  @IsOptional()
  readonly caption?: string;

  @ValidateIf(o => o.type === ChatResponseType.ERROR)
  @IsEnum(ErrorCode)
  @IsNotEmpty()
  readonly errorCode?: ErrorCode;

  private constructor(
    success: boolean,
    type: ChatResponseType,
    text?: string,
    url?: string,
    caption?: string,
    errorCode?: ErrorCode,
  ) {
    this.success = success;
    this.type = type;
    this.text = text;
    this.url = url;
    this.caption = caption;
    this.errorCode = errorCode;
  }

  static text(content: string): ChatResponseDto {
    return new ChatResponseDto(true, ChatResponseType.TEXT, content);
  }

  static media(url: string, caption?: string): ChatResponseDto {
    return new ChatResponseDto(true, ChatResponseType.MEDIA, undefined, url, caption);
  }

  static ignore(): ChatResponseDto {
    return new ChatResponseDto(true, ChatResponseType.IGNORE);
  }

  static error(message: string, errorCode: ErrorCode): ChatResponseDto {
    return new ChatResponseDto(false, ChatResponseType.ERROR, message, undefined, undefined, errorCode);
  }
}
