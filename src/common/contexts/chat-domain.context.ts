export interface CommandContext {
  readonly senderId: string;
  readonly sessionId: string;
  readonly command: string;
  readonly args: string[];
}

export interface GeminiContext {
  readonly senderId: string;
  readonly senderName?: string;
  readonly platform: string;
  readonly sessionId: string;
  readonly prompt: string;
  readonly mediaUrls: string[];
  readonly previousInteractionId?: string;
  readonly sessionPrompt?: string;
}

export interface ReactionContext {
  readonly sessionId: string;
  readonly senderId: string;
  readonly senderName?: string;
  readonly message: string;
}
