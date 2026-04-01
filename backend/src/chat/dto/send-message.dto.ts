import { IsString, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString() @IsOptional() sessionId?: string;
  @IsString() @IsOptional() guestId?: string;
  @IsString() modelId: string;
  @IsString() content: string;
  @IsArray() @IsOptional() attachments?: { type: string; url: string; name: string }[];
}

export class CreateSessionDto {
  @IsString() modelId: string;
  @IsOptional() isGuest?: boolean;
}
