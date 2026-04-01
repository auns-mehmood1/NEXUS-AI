import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentEntry, ContentEntrySchema } from './schemas/content-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentEntry.name, schema: ContentEntrySchema },
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
