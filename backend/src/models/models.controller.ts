import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private modelsService: ModelsService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('type') type?: string, @Query('lab') lab?: string, @Query('maxPrice') maxPrice?: string) {
    return this.modelsService.findAll({ search, type, lab, maxPrice: maxPrice ? parseFloat(maxPrice) : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const model = this.modelsService.findOne(id);
    if (!model) throw new NotFoundException(`Model ${id} not found`);
    return model;
  }
}
