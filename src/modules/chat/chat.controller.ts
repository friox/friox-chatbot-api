import { ChatRequestDto } from '@/common/dto/chat-request.dto';
import { ChatResponseDto } from '@/common/dto/chat-response.dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.handleChat(dto);
  }
}
