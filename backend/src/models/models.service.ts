import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MODELS_DATA } from './models.data';
import {
  CatalogModel,
  CatalogModelDocument,
} from './schemas/model.schema';

@Injectable()
export class ModelsService implements OnModuleInit {
  constructor(
    @InjectModel(CatalogModel.name)
    private readonly catalogModel: Model<CatalogModelDocument>,
  ) {}

  async onModuleInit() {
    await this.seedModels();
  }

  async findAll(query: {
    search?: string;
    type?: string;
    lab?: string;
    maxPrice?: number;
  }) {
    const filters: Record<string, unknown> = {};

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filters.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { desc: { $regex: escaped, $options: 'i' } },
        { org: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (query.type) {
      filters.types = query.type;
    }

    if (query.lab) {
      filters.lab = query.lab;
    }

    if (query.maxPrice !== undefined) {
      filters.price_start = { $lte: query.maxPrice };
    }

    return this.catalogModel.find(filters).sort({ rating: -1, reviews: -1 }).lean();
  }

  async findOne(id: string) {
    return this.catalogModel.findOne({ id }).lean();
  }

  private async seedModels() {
    const operations = MODELS_DATA.map((model) => ({
      updateOne: {
        filter: { id: model.id },
        update: { $set: model },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await this.catalogModel.bulkWrite(operations);
    }
  }
}
