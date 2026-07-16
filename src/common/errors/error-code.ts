interface ErrorMetadata {
  userMessage: string;
  debugMessage: string;
}

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  COMMAND_NOT_FOUND = 'COMMAND_NOT_FOUND',
  COMMAND_EXECUTION_FAILED = 'COMMAND_EXECUTION_FAILED',
  INVALID_EXTERNAL_API_RESPONSE = 'INVALID_EXTERNAL_API_RESPONSE',
  NO_MATCHING_RULE = 'NO_MATCHING_RULE',
  INVALID_COMMAND_ARGUMENTS = 'INVALID_COMMAND_ARGUMENTS',
  BAD_REQUEST = 'BAD_REQUEST',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

export const ERROR_REGISTRY: Record<ErrorCode, ErrorMetadata> = {
  UNKNOWN_ERROR: {
    userMessage: '알 수 없는 에러가 발생했습니다.',
    debugMessage: 'An unexpected internal error occurred.',
  },
  COMMAND_NOT_FOUND: {
    userMessage: '존재하지 않는 명령어입니다.',
    debugMessage: 'Command not found.',
  },
  COMMAND_EXECUTION_FAILED: {
    userMessage: '명령어 실행 중 오류가 발생했습니다.',
    debugMessage: 'Failed to execute command.',
  },
  INVALID_EXTERNAL_API_RESPONSE: {
    userMessage: '외부 API 요청의 응답이 유효하지 않습니다.',
    debugMessage: 'Invalid response or empty data from external API.',
  },
  NO_MATCHING_RULE: {
    userMessage: '매칭되는 규칙이 없습니다.',
    debugMessage: 'No matching commands or reaction rules found for the message.',
  },
  INVALID_COMMAND_ARGUMENTS: {
    userMessage: '올바르지 않은 매개변수입니다. 사용법을 확인해 주세요.',
    debugMessage: 'Invalid command arguments provided.',
  },
  BAD_REQUEST: {
    userMessage: '잘못된 요청 형식입니다.',
    debugMessage: 'Request validation failed.',
  },
  EXTERNAL_API_ERROR: {
    userMessage: '외부 API 요청 중 오류가 발생했습니다.',
    debugMessage: 'Failed to call external API service due to request failure, network error, or bad status code.',
  }
}
