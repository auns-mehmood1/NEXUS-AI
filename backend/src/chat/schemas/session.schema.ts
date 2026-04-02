import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ _id: false })
export class Attachment {
  @Prop() type: string;
  @Prop() url: string;
  @Prop() name: string;
}

@Schema({ _id: false })
export class Message {
  @Prop({ enum: ['user', 'assistant'], required: true }) role: string;
  @Prop({ required: true, default: '' }) content: string;
  @Prop({ default: () => new Date() }) timestamp: Date;
  @Prop({ type: [Attachment], default: [] }) attachments: Attachment[];
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, default: null }) userId: string | null;
  @Prop({ type: String, default: null }) guestId: string | null;
  @Prop({ required: true }) modelId: string;
  @Prop({ type: [Message], default: [] }) messages: Message[];
  @Prop({ type: Date, default: null }) expiresAt: Date | null;
  @Prop({ default: false }) migrated: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ userId: 1 });
SessionSchema.index({ guestId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
