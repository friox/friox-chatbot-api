import { ChatResponseType } from "@/common/dto/chat-response.dto";
import { ERROR_REGISTRY, ErrorCode } from "@/common/errors/error-code";
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse() as any;

    const errorMessages = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message.join(', ')
      : exceptionResponse.message;

    const metadata = ERROR_REGISTRY[ErrorCode.BAD_REQUEST];

    response.status(HttpStatus.OK).json({
      success: false,
      type: ChatResponseType.ERROR,
      errorCode: ErrorCode.BAD_REQUEST,
      text: `${metadata.userMessage} ${errorMessages}`
    });
  }
}
