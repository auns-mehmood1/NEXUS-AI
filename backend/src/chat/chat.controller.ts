import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateSessionDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class MigrateDto { @IsString() guestId: string; }

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('session')
  createSession(@Body() dto: CreateSessionDto, @Request() req: any) {
    const userId = req.user?._id;
    return this.chatService.createSession(dto, userId);
  }

  @Post('send')
  sendMessage(@Body() dto: SendMessageDto, @Request() req: any) {
    const userId = req.user?._id;
    return this.chatService.sendMessage(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(@CurrentUser() user: any) {
    return this.chatService.getHistory(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('session/:id')
  deleteSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.deleteSession(id, user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('migrate')
  migrate(@Body() body: MigrateDto, @CurrentUser() user: any) {
    return this.chatService.migrateGuestSessions(body.guestId, user._id);
  }
}
