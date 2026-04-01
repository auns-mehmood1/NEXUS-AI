import { IsString, IsEmail, MinLength } from 'class-validator';

export class ContactDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(10) message: string;
}

export class FeedbackDto {
  @IsString() message: string;
  @IsEmail() email?: string;
  rating?: number;
}
