import { DatabaseModule } from '@/modules/database/database.module';
import { GoogleGenAI } from '@google/genai';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TOKENS } from 'src/common/constants/di-tokens';
import { GeminiService } from './gemini.service';
import { PromptService } from './prompt.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: TOKENS.GEMINI_CLIENT,
      useFactory: (config: ConfigService) => {
        const apiKey = config.getOrThrow<string>('GEMINI_API_KEY');
        return new GoogleGenAI({ apiKey });
      },
      inject: [ConfigService],
    },
    PromptService,
    GeminiService,
  ],
  exports: [GeminiService, PromptService],
})
export class GeminiModule {}
