import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ContactDto, FeedbackDto } from './dto/contact.dto';

@Controller('forms')
export class FormsController {
  private readonly logger = new Logger(FormsController.name);

  @Post('contact')
  contact(@Body() dto: ContactDto) {
    this.logger.log(`Contact form: ${dto.email} — ${dto.message.slice(0, 50)}`);
    return { success: true, message: 'Thank you for your message. We\'ll be in touch soon.' };
  }

  @Post('feedback')
  feedback(@Body() dto: FeedbackDto) {
    this.logger.log(`Feedback: ${dto.message.slice(0, 50)}`);
    return { success: true, message: 'Thanks for your feedback!' };
  }
}
