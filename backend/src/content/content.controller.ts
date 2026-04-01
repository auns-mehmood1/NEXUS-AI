import { Controller, Get } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('public')
  getPublicContent() {
    return this.contentService.getPublicContent();
  }
}
