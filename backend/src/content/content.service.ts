import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentEntry, ContentEntryDocument } from './schemas/content-entry.schema';
import { PUBLIC_CONTENT_SEED, type PublicContentKey, type PublicContentSeed } from './content.seed';

@Injectable()
export class ContentService implements OnModuleInit {
  constructor(
    @InjectModel(ContentEntry.name)
    private readonly contentEntryModel: Model<ContentEntryDocument>,
  ) {}

  async onModuleInit() {
    await this.seedContent();
  }

  async getPublicContent(): Promise<PublicContentSeed> {
    const keys = Object.keys(PUBLIC_CONTENT_SEED);
    const docs = await this.contentEntryModel
      .find({ key: { $in: keys } })
      .lean();

    const content = docs.reduce<Record<string, unknown>>((acc, doc) => {
      acc[doc.key as PublicContentKey] = doc.value as PublicContentSeed[PublicContentKey];
      return acc;
    }, {});

    return {
      ...PUBLIC_CONTENT_SEED,
      ...content,
    } as PublicContentSeed;
  }

  private async seedContent() {
    const operations = Object.entries(PUBLIC_CONTENT_SEED).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await this.contentEntryModel.bulkWrite(operations);
    }
  }
}
