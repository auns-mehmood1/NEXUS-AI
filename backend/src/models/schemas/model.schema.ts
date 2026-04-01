import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CatalogModelDocument = CatalogModel & Document;

@Schema({ timestamps: true })
export class CatalogModel {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  bg: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  lab: string;

  @Prop({ required: true })
  org: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  badge: string;

  @Prop({ default: '' })
  badgeClass: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  reviews: number;

  @Prop({ required: true })
  price: string;

  @Prop({ type: [String], default: [] })
  types: string[];

  @Prop({ required: true, index: true })
  price_start: number;

  @Prop({ required: true })
  context: string;

  @Prop({ required: true, index: true })
  provider: string;
}

export const CatalogModelSchema = SchemaFactory.createForClass(CatalogModel);
CatalogModelSchema.index({ name: 'text', desc: 'text', org: 'text' });
