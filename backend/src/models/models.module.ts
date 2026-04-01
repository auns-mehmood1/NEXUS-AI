import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { CatalogModel, CatalogModelSchema } from './schemas/model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogModel.name, schema: CatalogModelSchema },
    ]),
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
