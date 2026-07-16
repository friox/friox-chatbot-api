import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

const ALLOWED_PLATFORMS = ['telegram', 'minecraft'] as const;
export type MessengerPlatform = typeof ALLOWED_PLATFORMS[number];

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'platform is required' })
  @IsIn(ALLOWED_PLATFORMS, { message: 'platform is not valid' })
  platform: MessengerPlatform;

  @IsString()
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsString()
  @IsNotEmpty({ message: 'message is required' })
  message: string;

  @IsArray({ message: 'mediaUrls must be an array' })
  @IsUrl({}, { each: true, message: 'Each mediaUrl must be a valid URL' })
  @IsOptional()
  mediaUrls?: string[];
}
