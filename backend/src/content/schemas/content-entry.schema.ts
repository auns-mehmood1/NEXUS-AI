import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ContentEntryDocument = ContentEntry & Document;

@Schema({ timestamps: true })
export class ContentEntry {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: unknown;
}

export const ContentEntrySchema = SchemaFactory.createForClass(ContentEntry);
